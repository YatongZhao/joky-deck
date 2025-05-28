import { GearData, GearType } from "./core/types";
import { useSelector } from "@xstate/react";
import { GearEntity } from "./GearEntity";
import { finalMatrix$, lastMousePosition$ } from "./store";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { v4 } from "uuid";
import { mat3, vec2 } from "gl-matrix";
import { getGearTransformVector } from "./core/gear";
import { fromEvent, animationFrames, merge, timer } from "rxjs";
import { combineLatest } from "rxjs";
import { store, useAppDispatch, useAppSelector } from "./store/redux";
import { addGear, selectAllGears, selectGearById, updateGear } from "./store/redux/slices/gearsSlice";
import { editorMachineSelector, editorMachineSendSelector } from "./store/redux/slices/editorMachineSlice";
import { omit } from "ramda";
import { initializeVirtualGearState } from "./store/redux/slices/virtualGear";
import { __internal_virtual_gear_id__ } from "./constant";
import { setHoveredGearId } from "./store/redux/slices/hoverSlice";
import { dynamicGearPositionMap } from "./store/dynamicGearPosition";

/**
 * 
 * @param gear 
 * @param gears 
 * @param time milliseconds
 * @returns 
 */
export const getGearPosition = (gear: GearData | null | undefined, gears: GearData[], time: number, gearProjectModule: number): vec2 => {
  if (!gear) return vec2.create();
  const parentGear = gears.find(g => g.id === gear.parentId);

  if (!parentGear) {
    return gear.position;
  }

  const parentGearTeeth = parentGear?.teeth ?? 1;
  const parentGearPosition = getGearPosition(parentGear, gears, time, gearProjectModule);
  const gearSelfSpeed = gear.speed;
  const deltaPositionAngle = gearSelfSpeed * time / parentGearTeeth * gear.teeth;
  const positionAngle = gear.positionAngle + deltaPositionAngle;
  const position = vec2.create();
  const transformVector = getGearTransformVector(positionAngle, gear.teeth, parentGearTeeth, gearProjectModule);
  const transformMatrix = mat3.create();
  mat3.translate(transformMatrix, transformMatrix, transformVector);
  return vec2.transformMat3(position, parentGearPosition, transformMatrix);
}

export const getGearAngle = (gear: GearData | null | undefined, gears: GearData[], time: number): { angle: number, direction: 1 | -1 } => {
  if (!gear) return { angle: 0, direction: 1 };
  const parentGear = gears.find(g => g.id === gear.parentId);
  const parentGearAngle = getGearAngle(parentGear, gears, time);
  const deltaPositionAngle = parentGear ? gear.speed * time / (parentGear.teeth ?? 1) * gear.teeth : 0;
  const positionAngle = gear.positionAngle + deltaPositionAngle;
  const teeth = gear.teeth;
  const parentTeeth = parentGear?.teeth ?? 0;
  const direction = -parentGearAngle.direction as 1 | -1;
  
  // Calculate the total angle based on parent gear's angle and position
  const angleBase = -parentGearAngle.angle * parentTeeth / teeth + direction * (180) % (360 / teeth) + 180 / teeth + positionAngle * (parentTeeth + teeth) / teeth;
  const angle = angleBase + gear.speed * time - deltaPositionAngle / gear.teeth * (parentGear?.teeth ?? 1);

  return { angle: angle % 360, direction };
};

export const getGearSpeed = (gear: GearData | null | undefined, gears: GearData[]): number => {
  if (!gear) return 0;
  const parentGear = gears.find(g => g.id === gear.parentId);
  const parentGearSpeed = getGearSpeed(parentGear, gears);
  const teeth = gear.teeth;
  const selfSpeed = gear.speed;
  const parentTeeth = parentGear?.teeth ?? 1;
  const parentInputSpeed = -parentGearSpeed * parentTeeth / teeth;
  return parentInputSpeed + selfSpeed;
};

export type GearParserProps = {
  gearId: string;
}

// Helper function to recursively find all descendant gear IDs
const findAllDescendantGearIds = (gearId: string, gears: GearData[]): Set<string> => {
  const descendants = new Set<string>();
  
  const findDescendants = (currentId: string) => {
    // Find all direct children
    const children = gears.filter(gear => gear.parentId === currentId);
    
    // Add each child and recursively find their descendants
    children.forEach(child => {
      descendants.add(child.id);
      findDescendants(child.id);
    });
  };

  findDescendants(gearId);
  return descendants;
};

export const GearParser = ({ gearId }: GearParserProps) => {
  const ref = useRef<SVGPathElement>(null);
  const gearData = useAppSelector((state) => selectGearById(state, gearId));
  const editorMachineActor = useAppSelector(editorMachineSelector);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  const editorMachineSend = useAppSelector(editorMachineSendSelector);
  const allGears = useAppSelector(selectAllGears);
  const dispatch = useAppDispatch();

  // Memoize the descendant gears calculation
  const activeGearDescendants = useMemo(() => 
    activeGearId && gearData ? findAllDescendantGearIds(activeGearId, allGears) : new Set<string>(),
    [activeGearId, allGears, gearData]
  );

  // Memoize the relevant gears set
  const relevantGearIds = useMemo(() => {
    const ids = new Set<string>();
    if (activeGearId) ids.add(activeGearId);
    activeGearDescendants.forEach(id => ids.add(id));
    return ids;
  }, [activeGearId, activeGearDescendants]);

  // Memoize the dimmed state
  const dimmed = useMemo(() => 
    relevantGearIds.size > 0 && !relevantGearIds.has(gearId),
    [relevantGearIds, gearId]
  );

  // Memoize the active state
  const isActive = useMemo(() => 
    activeGearId === gearId,
    [activeGearId, gearId]
  );

  const handleClick = useCallback(() => {
    editorMachineSend({
      type: 'selectGear',
      gearId,
    });
  }, [gearId, editorMachineSend]);

  const handleMouseEnter = useCallback(() => {
    dispatch(setHoveredGearId(gearId));
  }, [gearId, dispatch]);

  const handleMouseLeave = useCallback(() => {
    dispatch(setHoveredGearId(null));
  }, [dispatch]);

  if (!gearData) {
    return null;
  }

  return <GearEntity
    ref={ref}
    id={gearId}
    withHole
    active={isActive}
    dimmed={dimmed}
    onClick={handleClick}
    onMouseEnter={handleMouseEnter}
    onMouseLeave={handleMouseLeave}
  />
}

export const RelativeGearToAdd = () => {
  const dispatch = useAppDispatch();
  const ref = useRef<SVGPathElement>(null);
  const editorMachineSend = useAppSelector(editorMachineSendSelector);
  const editorMachineActor = useAppSelector(editorMachineSelector);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  // const virtualGear = useAppSelector((state) => state.virtualGear);
  const virtualGear = useAppSelector((state) => selectGearById(state, __internal_virtual_gear_id__)!);
  useEffect(() => {
    dispatch(updateGear({
      id: __internal_virtual_gear_id__,
      changes: {
        parentId: activeGearId,
      }
    }));
  }, [activeGearId, dispatch]);

  const activeGear = useAppSelector((state) => selectGearById(state, activeGearId ?? ''));
  const [virtualGearSetter$] = useState(combineLatest([
    merge(fromEvent<MouseEvent>(window, 'mousemove'), lastMousePosition$),
    animationFrames(),
  ]));
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const subscription = timer(120).subscribe(() => setStarted(true));
    return () => subscription.unsubscribe();
  }, [virtualGearSetter$]);

  useEffect(() => {
    const subscription = virtualGearSetter$.subscribe(([event]) => {
      const storeState = store.getState();
      const gearProjectModule = storeState.module.value;
      const matrix = finalMatrix$.getValue();
      const activeGearSvgPosition = activeGearId ? dynamicGearPositionMap.get(activeGearId) ?? vec2.create() : vec2.create();
      const mouseGlobalPosition = vec2.fromValues(event.clientX, event.clientY);
      const reverseMatrix = mat3.create();
      mat3.invert(reverseMatrix, matrix);
      const mouseSvgPosition = vec2.transformMat3(vec2.create(), mouseGlobalPosition, reverseMatrix);

      const distance = Math.hypot(mouseSvgPosition[0] - activeGearSvgPosition[0], mouseSvgPosition[1] - activeGearSvgPosition[1]);
      const angle = Math.atan2(mouseSvgPosition[1] - activeGearSvgPosition[1], mouseSvgPosition[0] - activeGearSvgPosition[0]);
      const virtualGearChildTeeth = Math.round(distance / gearProjectModule - (activeGear?.teeth ?? 0) / 2) * 2;

      dispatch(updateGear({
        id: __internal_virtual_gear_id__,
        changes: {
          teeth: virtualGearChildTeeth < 3 ? 3 : virtualGearChildTeeth,
          positionAngle: 360 * angle / (2 * Math.PI),
        }
      }));
    });

    return () => subscription.unsubscribe();
  }, [activeGearId, activeGear, virtualGearSetter$, dispatch]);

  const handleClick = useCallback(() => {
    editorMachineSend({ type: 'exitAddingMode' });
    dispatch(addGear({
      ...omit(['id', 'color'], virtualGear),
      id: v4(),
    }));
    dispatch(updateGear({
      id: __internal_virtual_gear_id__,
      changes: initializeVirtualGearState(),
    }));
  }, [virtualGear, dispatch, editorMachineSend]);

  return started ? <GearEntity
    ref={ref}
    id={virtualGear.id}
    withHole={false}
    active
    onClick={handleClick}
  /> : null;
}

export const AbsoluteGearToAdd = () => {
  const dispatch = useAppDispatch();
  const ref = useRef<SVGPathElement>(null);
  const editorMachineSend = useAppSelector(editorMachineSendSelector);
  const virtualGear = useAppSelector((state) => selectGearById(state, __internal_virtual_gear_id__)!);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    dispatch(updateGear({
      id: __internal_virtual_gear_id__,
      changes: {
        type: GearType.Absolute,
        parentId: null,
        speed: 1,
        teeth: 10,
      },
    }));
  }, [dispatch]);

  // Mouse move: update virtual gear position
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const matrix = finalMatrix$.getValue();
      const mouseGlobalPosition = vec2.fromValues(event.clientX, event.clientY);
      const reverseMatrix = mat3.create();
      mat3.invert(reverseMatrix, matrix);
      const mouseSvgPosition = vec2.transformMat3(vec2.create(), mouseGlobalPosition, reverseMatrix);
      dispatch(updateGear({
        id: __internal_virtual_gear_id__,
        changes: {
          position: [mouseSvgPosition[0], mouseSvgPosition[1]],
        }
      }));
    };
    window.addEventListener('mousemove', handleMouseMove);
    const timerId = setTimeout(() => setStarted(true), 120);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timerId);
    };
  }, [dispatch]);

  // Keyboard: up/down to change teeth
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        dispatch(updateGear({
          id: __internal_virtual_gear_id__,
          changes: { teeth: Math.max(3, (virtualGear.teeth ?? 0) + 1) }
        }));
      } else if (event.key === 'ArrowDown') {
        dispatch(updateGear({
          id: __internal_virtual_gear_id__,
          changes: { teeth: Math.max(3, (virtualGear.teeth ?? 0) - 1) }
        }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, virtualGear.teeth]);

  const handleClick = useCallback(() => {
    editorMachineSend({ type: 'exitAddingMode' });
    dispatch(addGear({
      ...omit(['id', 'color'], virtualGear),
      id: v4(),
    }));
    dispatch(updateGear({
      id: __internal_virtual_gear_id__,
      changes: initializeVirtualGearState(),
    }));
  }, [virtualGear, dispatch, editorMachineSend]);

  return started ? <GearEntity
    ref={ref}
    id={virtualGear.id}
    withHole={false}
    active
    onClick={handleClick}
  /> : null;
}

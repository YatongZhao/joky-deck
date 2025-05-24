import { GearData } from "./core/types";
import { useSelector } from "@xstate/react";
import { GearEntity } from "./GearEntity";
import { finalMatrix$, lastMousePosition$ } from "./store";
import { useTheme } from "./theme";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import { mat3, vec2 } from "gl-matrix";
import { getGearTransformVector } from "./core/gear";
import { debounceTime, take, tap, throttleTime } from "rxjs/operators";
import { fromEvent, BehaviorSubject, animationFrames, merge, timer } from "rxjs";
import { combineLatest } from "rxjs";
import { gsap } from "gsap";
import { store, useAppDispatch, useAppSelector } from "./store/redux";
import { addGear, selectAllGears, selectAllUserGears, selectGearById, updateGear } from "./store/redux/slices/gearsSlice";
import { editorMachineSelector, editorMachineSendSelector } from "./store/redux/slices/editorMachineSlice";
import { pushUndo } from "./store/redux/slices/undoManagerSlice";
// import virtualGear, { resetVirtualGear, setVirtualGear } from "./store/redux/slices/virtualGear";
import { omit } from "ramda";
import { initializeVirtualGearState } from "./store/redux/slices/virtualGear";

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

const getGearSpeed = (gear: GearData | null | undefined, gears: GearData[]): number => {
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

export const GearParser = ({ gearId }: GearParserProps) => {
  const ref = useRef<SVGPathElement>(null);
  const theme = useTheme();
  const gearData = useAppSelector((state) => selectGearById(state, gearId));
  const gearProjectModule = useAppSelector((state) => state.module.value);
  const editorMachineActor = useAppSelector(editorMachineSelector);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  const editorMachineSend = useAppSelector(editorMachineSendSelector);
  const gears = useAppSelector(selectAllUserGears);

  const handleClick = useCallback(() => {
    editorMachineSend({
      type: 'selectGear',
      gearId,
    });
  }, [gearId, editorMachineSend]);

  if (!gearData) {
    return null;
  }

  return <GearEntity
    ref={ref}
    id={gearId}
    withHole
    active={activeGearId === gearId}
    onClick={handleClick}
  />
}

export const GearToAdd = () => {
  const dispatch = useAppDispatch();
  const ref = useRef<SVGPathElement>(null);
  const theme = useTheme();
  const editorMachineSend = useAppSelector(editorMachineSendSelector);
  const gearProjectModule = useAppSelector((state) => state.module.value);
  const editorMachineActor = useAppSelector(editorMachineSelector);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  // const virtualGear = useAppSelector((state) => state.virtualGear);
  const virtualGear = useAppSelector((state) => selectGearById(state, '__internal_virtual_gear_id__')!);
  useEffect(() => {
    dispatch(updateGear('__internal_virtual_gear_id__', {
      parentId: activeGearId,
    }));
  }, [activeGearId, dispatch]);

  const activeGear = useAppSelector((state) => selectGearById(state, activeGearId ?? ''));
  const gears = useAppSelector(selectAllGears);
  const speed = getGearSpeed(virtualGear, gears);
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
      const gears = selectAllGears(storeState);
      const gearProjectModule = storeState.module.value;
      const matrix = finalMatrix$.getValue();
      const activeGearSvgPosition = getGearPosition(activeGear, gears, gsap.ticker.time, gearProjectModule);
      const mouseGlobalPosition = vec2.fromValues(event.clientX, event.clientY);
      const reverseMatrix = mat3.create();
      mat3.invert(reverseMatrix, matrix);
      const mouseSvgPosition = vec2.transformMat3(vec2.create(), mouseGlobalPosition, reverseMatrix);

      const distance = Math.hypot(mouseSvgPosition[0] - activeGearSvgPosition[0], mouseSvgPosition[1] - activeGearSvgPosition[1]);
      const angle = Math.atan2(mouseSvgPosition[1] - activeGearSvgPosition[1], mouseSvgPosition[0] - activeGearSvgPosition[0]);
      const virtualGearChildTeeth = Math.round(distance / gearProjectModule - (activeGear?.teeth ?? 0) / 2) * 2;

      dispatch(updateGear('__internal_virtual_gear_id__', {
        teeth: virtualGearChildTeeth < 3 ? 3 : virtualGearChildTeeth,
        positionAngle: 360 * angle / (2 * Math.PI),
      }));
    });

    return () => subscription.unsubscribe();
  }, [activeGear, virtualGearSetter$, dispatch]);

  const handleClick = useCallback(() => {
    if (activeGearId) {
      editorMachineSend({
        type: 'selectGear',
        gearId: activeGearId,
      });
    }
    dispatch(addGear({
      ...omit(['id', 'color'], virtualGear),
      id: v4(),
    }));
    dispatch(updateGear('__internal_virtual_gear_id__', initializeVirtualGearState()));
    dispatch(pushUndo("Add Gear"));
  }, [virtualGear, activeGearId, dispatch, editorMachineSend]);

  return started ? <GearEntity
    ref={ref}
    id={virtualGear.id}
    withHole={false}
    active
    onClick={handleClick}
  /> : null;
}

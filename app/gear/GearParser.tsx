import { GearData } from "./core/types";
import { useSelector } from "@xstate/react";
import { GearEntity } from "./GearEntity";
import { finalMatrix$ } from "./store";
import { useTheme } from "./theme";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import { GearType } from "./core/types";
import { mat3, vec2 } from "gl-matrix";
import { getGearTransformVector } from "./core/gear";
import { debounceTime } from "rxjs/operators";
import { fromEvent, BehaviorSubject } from "rxjs";
import { combineLatest } from "rxjs";
import { gsap } from "gsap";
import { useAppDispatch, useAppSelector } from "./store/redux";
import { addGear, selectAllGears, selectGearById } from "./store/redux/slices/gearsSlice";
import { vec2ToPosition } from "./utils";
import { editorMachineSelector, editorMachineSendSelector } from "./store/redux/slices/editorMachineSlice";
import { pushUndo } from "./store/redux/slices/undoManagerSlice";

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

const getGearAngle = (gear: GearData | null | undefined, gears: GearData[], time: number): { angle: number, direction: 1 | -1 } => {
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
  const gears = useAppSelector(selectAllGears);
  // const { angle } = getGearAngle(gearData, gears);
  const speed = getGearSpeed(gearData, gears);

  const handleClick = useCallback(() => {
    editorMachineSend({
      type: 'selectGear',
      gearId,
    });
  }, [gearId, editorMachineSend]);

  useEffect(() => {
    const tickerCallback = (time: number) => {
      if (ref.current) {
        const { angle } = getGearAngle(gearData, gears, time);
        const position = getGearPosition(gearData, gears, time, gearProjectModule);
        ref.current.setAttribute('transform', `translate(${position[0]}, ${position[1]}) rotate(${angle})`);
      }
    };
    gsap.ticker.add(tickerCallback);
    return () => gsap.ticker.remove(tickerCallback);
  }, [speed, gearData, gears, gearProjectModule]);

  if (!gearData) {
    return null;
  }

  return <GearEntity
    ref={ref}
    teeth={gearData.teeth}
    module={gearProjectModule}
    withHole
    fillColor={gearData.color || theme.colors.gray[4]}
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
  const [virtualGearChild, setVirtualGearChild] = useState<GearData>({
    id: v4(),
    type: GearType.Relative,
    teeth: 3,
    parentId: activeGearId,
    positionAngle: 0,
    position: vec2ToPosition(vec2.create()),
    speed: 0,
  });
  const activeGear = useAppSelector((state) => selectGearById(state, activeGearId ?? ''));
  const gears = useAppSelector(selectAllGears);
  // const { angle } = getGearAngle(virtualGearChild, gears);
  const speed = getGearSpeed(virtualGearChild, gears);
  const [activeGearSvgPosition$] = useState<BehaviorSubject<vec2>>(new BehaviorSubject(getGearPosition(activeGear, gears, gsap.ticker.time, gearProjectModule)));

  useEffect(() => {
    const tickerCallback = () => {
      activeGearSvgPosition$.next(getGearPosition(activeGear, gears, gsap.ticker.time, gearProjectModule));
    }
    gsap.ticker.add(tickerCallback);
    return () => gsap.ticker.remove(tickerCallback);
  }, [activeGear, gears, gearProjectModule, activeGearSvgPosition$]);

  useEffect(() => {
    const tickerCallback = (time: number) => {
      if (ref.current) {
        const { angle } = getGearAngle(virtualGearChild, gears, time);
        const position = getGearPosition(virtualGearChild, gears, time, gearProjectModule);
        ref.current.setAttribute('transform', `translate(${position[0]}, ${position[1]}) rotate(${angle})`);
      }
    };
    gsap.ticker.add(tickerCallback);
    return () => gsap.ticker.remove(tickerCallback);
  }, [speed, virtualGearChild, gears, gearProjectModule]);

  useEffect(() => {
    const subscription = combineLatest([fromEvent<MouseEvent>(window, 'mousemove'), finalMatrix$, activeGearSvgPosition$]).pipe(debounceTime(5)).subscribe(([event, matrix, activeGearSvgPosition]) => {
      const mouseGlobalPosition = vec2.fromValues(event.clientX, event.clientY);
      const reverseMatrix = mat3.create();
      mat3.invert(reverseMatrix, matrix);
      const mouseSvgPosition = vec2.transformMat3(vec2.create(), mouseGlobalPosition, reverseMatrix);

      const distance = Math.hypot(mouseSvgPosition[0] - activeGearSvgPosition[0], mouseSvgPosition[1] - activeGearSvgPosition[1]);
      const angle = Math.atan2(mouseSvgPosition[1] - activeGearSvgPosition[1], mouseSvgPosition[0] - activeGearSvgPosition[0]);
      const virtualGearChildTeeth = Math.round(distance / gearProjectModule - (activeGear?.teeth ?? 0) / 2) * 2;

      setVirtualGearChild(prev => ({
        ...prev,
        teeth: virtualGearChildTeeth < 3 ? 3 : virtualGearChildTeeth,
        positionAngle: 360 * angle / (2 * Math.PI),
      }));
    });

    return () => subscription.unsubscribe();
  }, [gearProjectModule, activeGear, gears, virtualGearChild, activeGearSvgPosition$]);

  const handleClick = useCallback(() => {
    dispatch(addGear(virtualGearChild));
    setVirtualGearChild({
      ...virtualGearChild,
      id: v4(),
    });
    if (activeGearId) {
      editorMachineSend({
        type: 'selectGear',
        gearId: activeGearId,
      });
    }
    dispatch(pushUndo("Add Gear"));
  }, [virtualGearChild, activeGearId, dispatch, editorMachineSend]);

  return <GearEntity
    ref={ref}
    teeth={virtualGearChild.teeth}
    module={gearProjectModule}
    withHole={false}
    fillColor={theme.colors.blue[4]}
    active
    onClick={handleClick}
  />
}

import { GearData } from "./core/types";
import { useSelector } from "@xstate/react";
import { GearEntity } from "./GearEntity";
import { finalMatrix$, useEditorMachineSend, useGear, useGearProjectStore, useGearSvgPosition } from "./store";
import { useTheme } from "./theme";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 } from "uuid";
import { GearType } from "./core/types";
import { mat3, vec2 } from "gl-matrix";
import { getGearTransformVector } from "./core/gear";
import { debounceTime } from "rxjs/operators";
import { fromEvent } from "rxjs";
import { combineLatest } from "rxjs";
import { gsap } from "gsap";

/**
 * 
 * @param gear 
 * @param gears 
 * @param time milliseconds
 * @returns 
 */
const getGearPosition = (gear: GearData | null | undefined, gears: GearData[], time: number, gearProjectModule: number): vec2 => {
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

const getGearAngle = (gear: GearData | null | undefined, gears: GearData[]): { angle: number, direction: 1 | -1 } => {
  if (!gear) return { angle: 0, direction: 1 };
  const parentGear = gears.find(g => g.id === gear.parentId);
  const parentGearAngle = getGearAngle(parentGear, gears);
  const positionAngle = gear.positionAngle;
  const teeth = gear.teeth;
  const parentTeeth = parentGear?.teeth ?? 0;
  const direction = -parentGearAngle.direction as 1 | -1;
  
  // Calculate the total angle based on parent gear's angle and position
  const angle = -parentGearAngle.angle * parentTeeth / teeth + direction * (180) % (360 / teeth) + 180 / teeth + positionAngle * (parentTeeth + teeth) / teeth;

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
  const gearData = useGear(gearId);
  const gearProjectModule = useGearProjectStore(state => state.gearProject.module);
  const editorMachineActor = useGearProjectStore((state) => state.editorMachineActor);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  const send = useEditorMachineSend();
  const gears = useGearProjectStore(state => state.gearProject.gears);
  const { angle } = getGearAngle(gearData, gears);
  const speed = getGearSpeed(gearData, gears);

  const handleClick = useCallback(() => {
    send({
      type: 'selectGear',
      gearId,
    });
  }, [send, gearId]);

  useEffect(() => {
    const tickerCallback = (time: number) => {
      if (ref.current) {
        const position = getGearPosition(gearData, gears, time, gearProjectModule);
        ref.current.setAttribute('transform', `translate(${position[0]}, ${position[1]}) rotate(${angle + speed * time})`);
      }
    };
    gsap.ticker.add(tickerCallback);
    return () => gsap.ticker.remove(tickerCallback);
  }, [angle, speed, gearData, gears, gearProjectModule]);

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
  const ref = useRef<SVGPathElement>(null);
  const theme = useTheme();
  const send = useEditorMachineSend();
  const addGear = useGearProjectStore(state => state.addGear);
  const gearProjectModule = useGearProjectStore(state => state.gearProject.module);
  const editorMachineActor = useGearProjectStore((state) => state.editorMachineActor);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  const [virtualGearChild, setVirtualGearChild] = useState<GearData>({
    id: v4(),
    type: GearType.Relative,
    teeth: 3,
    parentId: activeGearId,
    positionAngle: 0,
    position: vec2.create(),
    speed: 0,
  });
  const activeGearSvgPosition = useGearSvgPosition(activeGearId);
  const activeGear = useGear(activeGearId);
  const gears = useGearProjectStore(state => state.gearProject.gears);
  const { angle } = getGearAngle(virtualGearChild, gears);
  const pushUndo = useGearProjectStore(state => state.pushUndo);
  const speed = getGearSpeed(virtualGearChild, gears);

  useEffect(() => {
    const tickerCallback = (time: number) => {
      if (ref.current) {
        const position = getGearPosition(virtualGearChild, gears, time, gearProjectModule);
        ref.current.setAttribute('transform', `translate(${position[0]}, ${position[1]}) rotate(${angle + speed * time})`);
      }
    };
    gsap.ticker.add(tickerCallback);
    return () => gsap.ticker.remove(tickerCallback);
  }, [angle, speed, virtualGearChild, gears, gearProjectModule]);

  useEffect(() => {
    const subscription = combineLatest([fromEvent<MouseEvent>(window, 'mousemove'), finalMatrix$]).pipe(debounceTime(5)).subscribe(([event, matrix]) => {
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
  }, [gearProjectModule, activeGear?.teeth, activeGearSvgPosition]);

  const handleClick = useCallback(() => {
    addGear(virtualGearChild);
    setVirtualGearChild({
      ...virtualGearChild,
      id: v4(),
    });
    if (activeGearId) {
      send({
        type: 'selectGear',
        gearId: activeGearId,
      });
    }
    pushUndo("Add Gear");
  }, [virtualGearChild, addGear, send, activeGearId, pushUndo]);

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

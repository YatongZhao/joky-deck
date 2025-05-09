import { useGearProjectStore, useGear } from "./store";

import { useSelector } from "@xstate/react";
import { useGearSvgPosition } from "./store";
import { vec2 } from "gl-matrix";
import { useCallback, useEffect, useRef, useState } from "react";
import { BehaviorSubject, skip } from "rxjs";
import { DragHandle } from "./DragHandle";

export const ActiveGearHandle = () => {
  const gearProject = useGearProjectStore((state) => state.gearProject);
  const setGear = useGearProjectStore((state) => state.setGear);
  const pushUndo = useGearProjectStore((state) => state.pushUndo);
  const editorMachineActor = useGearProjectStore((state) => state.editorMachineActor);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  const activeGear = useGear(activeGearId);
  const parentGearId = activeGear?.parentId;
  const parentGear = useGear(parentGearId);
  const activeGearSvgPosition = useGearSvgPosition(activeGearId);
  const parentGearSvgPosition = useGearSvgPosition(parentGearId);
  const [gearHandleSvgPosition$] = useState<BehaviorSubject<vec2>>(new BehaviorSubject(vec2.create()));
  const [isDragging, setIsDragging] = useState(false);
  const lastGearPositionInfoRef = useRef<{ teeth: number, positionAngle: number }>({ teeth: activeGear?.teeth ?? 0, positionAngle: activeGear?.positionAngle ?? 0 });

  useEffect(() => {
    if (!isDragging) {
      gearHandleSvgPosition$.next(activeGearSvgPosition);
    }
    const subscription = gearHandleSvgPosition$.pipe(skip(1)).subscribe((position) => {
      if (isDragging && activeGearId) {
        const angle = Math.atan2(position[1] - parentGearSvgPosition[1], position[0] - parentGearSvgPosition[0]);
        const distance = Math.hypot(position[0] - parentGearSvgPosition[0], position[1] - parentGearSvgPosition[1]);
        const teeth = Math.round(distance / gearProject.module - (parentGear?.teeth ?? 0) / 2) * 2;
        setGear(activeGearId, { teeth, positionAngle: 360 * angle / (2 * Math.PI) });
      }
    });

    return () => subscription.unsubscribe();
  }, [activeGearSvgPosition, gearHandleSvgPosition$, isDragging, parentGearSvgPosition, parentGear?.teeth, gearProject.module, setGear, activeGearId, pushUndo]);
  
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (activeGear?.teeth !== lastGearPositionInfoRef.current.teeth || activeGear?.positionAngle !== lastGearPositionInfoRef.current.positionAngle) {
      pushUndo(`Active Gear Handle Changed`);
    }
  }, [activeGear?.teeth, activeGear?.positionAngle, pushUndo]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    lastGearPositionInfoRef.current = { teeth: activeGear?.teeth ?? 0, positionAngle: activeGear?.positionAngle ?? 0 };
  }, [activeGear]);

  if (!parentGearId) {
    return null;
  }

  return <>
    <DragHandle svgPosition$={gearHandleSvgPosition$} onDragEnd={handleDragEnd} onDragStart={handleDragStart} />
  </>
}

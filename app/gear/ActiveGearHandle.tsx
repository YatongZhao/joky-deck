import { useGearProjectStore, useGear } from "./store";

import { useSelector } from "@xstate/react";
import { useGearSvgPosition } from "./store";
import { vec2 } from "gl-matrix";
import { useCallback, useEffect, useRef, useState } from "react";
import { BehaviorSubject, fromEvent, skip } from "rxjs";
import { DragHandle } from "./DragHandle";

export const ActiveGearHandle = () => {
  const gearProject = useGearProjectStore((state) => state.gearProject);
  const rootGearId = useGearProjectStore((state) => state.gearProject.rootGearId);
  const rootGearPosition = useGearProjectStore((state) => state.gearProject.rootGearPosition);
  const setRootGearPosition = useGearProjectStore((state) => state.setRootGearPosition);
  const setGear = useGearProjectStore((state) => state.setGear);
  const pushUndo = useGearProjectStore((state) => state.pushUndo);
  const editorMachineActor = useGearProjectStore((state) => state.editorMachineActor);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  const activeGear = useGear(activeGearId);
  const parentGearId = activeGear?.parentId;
  const parentGear = useGear(parentGearId);
  const activeGearSvgPosition = useGearSvgPosition(activeGearId);
  const maybeParentGearSvgPosition = useGearSvgPosition(parentGearId);
  const [targetSvgPosition$] = useState<BehaviorSubject<vec2>>(new BehaviorSubject(vec2.create()));
  const [handleSvgPosition$] = useState<BehaviorSubject<vec2>>(new BehaviorSubject(vec2.create()));
  const [isDragging, setIsDragging] = useState(false);
  const lastGearPositionInfoRef = useRef<{ teeth: number, positionAngle: number }>({ teeth: activeGear?.teeth ?? 0, positionAngle: activeGear?.positionAngle ?? 0 });

  const [isCtrlPressed, setIsCtrlPressed] = useState(false);

  useEffect(() => {
    const subscription = fromEvent<KeyboardEvent>(document, 'keydown').subscribe((event) => {
      setIsCtrlPressed(event.ctrlKey);
    });
    const ctrlUpSubscription = fromEvent<KeyboardEvent>(document, 'keyup').subscribe((event) => {
      setIsCtrlPressed(event.ctrlKey);
    });

    return () => {
      subscription.unsubscribe();
      ctrlUpSubscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    handleSvgPosition$.next(vec2.clone(activeGearSvgPosition));
  }, [activeGearSvgPosition, handleSvgPosition$]);

  useEffect(() => {
    if (!isDragging) {
      targetSvgPosition$.next(vec2.clone(activeGearSvgPosition));
    }
    const subscription = targetSvgPosition$.pipe(skip(1)).subscribe((position) => {
      if (!isDragging) return;
      if (!activeGearId) return;
      if (!activeGear) return;

      if (isCtrlPressed) {
        const parentGearSvgPosition = activeGearId === rootGearId ? rootGearPosition : maybeParentGearSvgPosition;
        // how far is the mouse from the parent gear?
        const distance = Math.hypot(position[0] - parentGearSvgPosition[0], position[1] - parentGearSvgPosition[1]);
        // project the distance onto the position angle of the active gear
        const angle = Math.atan2(position[1] - parentGearSvgPosition[1], position[0] - parentGearSvgPosition[0]);
        const projectedDistance = Math.abs(distance * Math.cos(angle - activeGear?.positionAngle / 180 * Math.PI));
        let teeth = Math.round(projectedDistance / gearProject.module - (parentGear?.teeth ?? 0) / 2) * 2;
        teeth = Math.max(teeth, 3);
        setGear(activeGearId, { teeth });
        return;
      }

      if (activeGearId === rootGearId) {
        setRootGearPosition(vec2.clone(position));
      } else {
        const angle = Math.atan2(position[1] - maybeParentGearSvgPosition[1], position[0] - maybeParentGearSvgPosition[0]);
        const distance = Math.hypot(position[0] - maybeParentGearSvgPosition[0], position[1] - maybeParentGearSvgPosition[1]);
        let teeth = Math.round(distance / gearProject.module - (parentGear?.teeth ?? 0) / 2) * 2;
        teeth = Math.max(teeth, 3);
        setGear(activeGearId, { teeth, positionAngle: 360 * angle / (2 * Math.PI) });
      }
    });

    return () => subscription.unsubscribe();
  }, [
    activeGearSvgPosition,
    targetSvgPosition$,
    isDragging, maybeParentGearSvgPosition, parentGear?.teeth, gearProject.module,
    setGear, activeGearId, pushUndo, rootGearId, rootGearPosition, setRootGearPosition,
    isCtrlPressed, activeGear,
  ]);

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

  useEffect(() => {
    if (!isDragging) return;
    const style = document.createElement('style');
    style.innerHTML = `
      * {
        cursor: move !important;
      }
    `
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    }
  }, [isDragging]);

  return <>
    <DragHandle targetSvgPosition$={targetSvgPosition$} handleSvgPosition$={handleSvgPosition$} onDragEnd={handleDragEnd} onDragStart={handleDragStart} shape="circle" />
  </>
}

import { useSelector } from "@xstate/react";
import { vec2 } from "gl-matrix";
import { useCallback, useEffect, useRef, useState } from "react";
import { BehaviorSubject, fromEvent, skip } from "rxjs";
import { DragHandle } from "./DragHandle";
import { GearType } from "./core/types";
import { getGearPosition } from "./GearParser";
import { gsap } from "gsap";
import { vec2ToPosition } from "./utils";
import { useAppDispatch, useAppSelector } from "./store/redux";
import { editorMachineSelector } from "./store/redux/slices/editorMachineSlice";
import { pushUndo } from "./store/redux/slices/undoManagerSlice";
import { selectAllGears, selectGearById, updateGear } from "./store/redux/slices/gearsSlice";

// TODO: This is a mess
export const ActiveGearHandle = () => {
  const dispatch = useAppDispatch();
  const gears = useAppSelector(selectAllGears);
  const gearProjectModule = useAppSelector((state) => state.module.value);
  const editorMachineActor = useAppSelector(editorMachineSelector);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);

  const activeGear = useAppSelector((state) => selectGearById(state, activeGearId ?? ''));
  const parentGearId = activeGear?.parentId;
  const parentGear = useAppSelector((state) => selectGearById(state, parentGearId ?? ''));
  const [activeGearSvgPosition$] = useState<BehaviorSubject<vec2>>(new BehaviorSubject(
    getGearPosition(activeGear, gears, gsap.ticker.time, gearProjectModule)
  ));
  const [targetSvgPosition$] = useState<BehaviorSubject<vec2>>(new BehaviorSubject(vec2.create()));
  const [handleSvgPosition$] = useState<BehaviorSubject<vec2>>(new BehaviorSubject(vec2.create()));
  const [isDragging, setIsDragging] = useState(false);
  const lastGearPositionInfoRef = useRef<{ teeth: number, positionAngle: number }>({ teeth: activeGear?.teeth ?? 0, positionAngle: activeGear?.positionAngle ?? 0 });

  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const startTeethRef = useRef(activeGear?.teeth ?? 0);

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
    const tickerCallback = () => {
      const activeGearSvgPosition = getGearPosition(activeGear, gears, gsap.ticker.time, gearProjectModule);
      activeGearSvgPosition$.next(vec2.clone(activeGearSvgPosition));
      handleSvgPosition$.next(vec2.clone(activeGearSvgPosition));
    }
    gsap.ticker.add(tickerCallback);
    return () => gsap.ticker.remove(tickerCallback);
  }, [activeGear, gears, gearProjectModule, activeGearSvgPosition$, handleSvgPosition$]);

  useEffect(() => {
    const subscription = targetSvgPosition$.pipe(skip(1)).subscribe((position) => {
      if (!isDragging) return;
      if (!activeGearId) return;
      if (!activeGear) return;

      const isAbsoluteGear = activeGear.type === GearType.Absolute;
      const maybeParentGearSvgPosition = getGearPosition(parentGear, gears, gsap.ticker.time, gearProjectModule);

      if (isCtrlPressed) {
        const parentGearSvgPosition = isAbsoluteGear ? activeGear.position : maybeParentGearSvgPosition;
        // how far is the mouse from the parent gear?
        const distance = Math.hypot(position[0] - parentGearSvgPosition[0], position[1] - parentGearSvgPosition[1]);
        // project the distance onto the position angle of the active gear
        const angle = Math.atan2(position[1] - parentGearSvgPosition[1], position[0] - parentGearSvgPosition[0]);
        const projectedDistance = Math.abs(distance * Math.cos(angle - activeGear?.positionAngle / 180 * Math.PI));
        let teeth = Math.round(projectedDistance / gearProjectModule - (parentGear?.teeth ?? 0) / 2) * 2;
        if (isAbsoluteGear) {
          teeth = startTeethRef.current + teeth * (Math.cos(angle - activeGear?.positionAngle / 180 * Math.PI) > 0 ? 1 : -1);
        }
        teeth = Math.max(teeth, 3);
        dispatch(updateGear(activeGearId, { teeth }));
        return;
      }

      if (isAbsoluteGear) {
        dispatch(updateGear(activeGearId, { position: vec2ToPosition(position) }));
      } else {
        const angle = Math.atan2(position[1] - maybeParentGearSvgPosition[1], position[0] - maybeParentGearSvgPosition[0]);
        const distance = Math.hypot(position[0] - maybeParentGearSvgPosition[0], position[1] - maybeParentGearSvgPosition[1]);
        let teeth = Math.round(distance / gearProjectModule - (parentGear?.teeth ?? 0) / 2) * 2;
        teeth = Math.max(teeth, 3);
        dispatch(updateGear(activeGearId, { teeth, positionAngle: 360 * angle / (2 * Math.PI) }));
      }
    });

    return () => subscription.unsubscribe();
  }, [
    targetSvgPosition$,
    isDragging, parentGear?.teeth, gearProjectModule,
    dispatch, activeGearId,
    isCtrlPressed, activeGear,
    gears, parentGear,
  ]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (activeGear?.teeth !== lastGearPositionInfoRef.current.teeth || activeGear?.positionAngle !== lastGearPositionInfoRef.current.positionAngle) {
      dispatch(pushUndo(`Active Gear Handle Changed`));
    }
  }, [activeGear?.teeth, activeGear?.positionAngle, dispatch]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    startTeethRef.current = activeGear?.teeth ?? 0;
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

  const handlePositionChange = useCallback((pos: vec2) => {
    targetSvgPosition$.next(pos);
  }, [targetSvgPosition$]);

  return <>
    <DragHandle
      handleSvgPosition$={handleSvgPosition$}
      onPositionChange={handlePositionChange}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      shape="circle"
    />
  </>
}

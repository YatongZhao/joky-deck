"use client"
import { useEffect, useState, useRef, useCallback } from "react";
import { displayMatrix$, globalViewBox$, viewBox$, viewBoxA$, viewBoxB$, viewBoxC$, viewBoxD$, viewBoxNext } from "./store";
import { ViewBox } from "./store";
import { GearSettingPanel } from "./reactionLayer/GearSettingPanel";
import { useModeHotKeys } from "./hooks/useMode";
import { CrossHair } from "./CrossHair";
import { ExportViewBoxController } from "./ExportViewBoxController";
import { mat3, vec2 } from "gl-matrix";
import { getScale } from "./core/coordinate";
import { ToolsPanel } from "./reactionLayer/ToolsPanel";
import { DragHandle } from "./DragHandle";
import { BehaviorSubject } from "rxjs";
import { useDrag } from "./hooks/useDrag";
import { useMergedRef } from "@mantine/hooks";
import { useSelector } from "@xstate/react";
import { ActiveGearHandle } from "./ActiveGearHandle";
import { GearProjectMenu } from "./reactionLayer/GearProjectMenu";
import { Controller } from "./reactionLayer/Controller";
import { MAX_SCALE, scaleSvgAtGlobalPoint } from "./reactionLayer/hooks/useScaleController";
import { MIN_SCALE } from "./reactionLayer/hooks/useScaleController";
import { ExportViewBoxFilter } from "./ExportViewBoxFilter";
import { GlobalViewBoxBackground } from "./GlobalViewBoxBackground";
import {
  __internal_gear_project_id__,
  __internal_view_box_controller_id__,
  __internal_export_view_box_filter_filter_id__,
  __internal_export_view_box_filter_mask_id__,
} from "./constant";
import { GearParser, GearToAdd } from "./GearParser";
import { editorMachineSelector } from "./store/redux/slices/editorMachineSlice";
import { useAppDispatch, useAppSelector } from "./store/redux";
import { selectAllUserGears, selectGearById } from "./store/redux/slices/gearsSlice";
import { persistViewBox } from "./store/redux/slices/viewBoxSlice";
import { persistDisplayMatrix } from "./store/redux/slices/displayMatrixSlice";
import { mat3ToMatrix } from "./utils";
import { useDeleteGear } from "./hooks/useDeleteGear";

const useWheelDrag = () => {
  const ref = useRef<SVGSVGElement>(null);
  const [deltaMatrix$] = useState(new BehaviorSubject<mat3>(mat3.create()));
  const [translateMatrix$] = useState(new BehaviorSubject<mat3>(mat3.create()));

  const handleWheel = useCallback((event: WheelEvent) => {
    if (event.ctrlKey) return;

    event.preventDefault();
    event.stopPropagation();
    const matrix = mat3.create();
    mat3.translate(matrix, matrix, [-event.deltaX, -event.deltaY]);
    deltaMatrix$.next(matrix);
    mat3.multiply(translateMatrix$.getValue(), matrix, translateMatrix$.getValue());
    translateMatrix$.next(translateMatrix$.getValue());
  }, [deltaMatrix$, translateMatrix$]);

  useEffect(() => {
    const target = ref.current;
    target?.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      target?.removeEventListener('wheel', handleWheel);
    };
  }, [handleWheel]);

  return { ref, translateMatrix$, deltaMatrix$ };
}

const useZoom = () => {
  const ZOOM_SPEED = 0.1;
  const lastEventTimeRef = useRef<number>(0);
  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    if (!event.ctrlKey) return;
    const currentTime = Date.now();
    const timeSinceLastEvent = currentTime - lastEventTimeRef.current;
    lastEventTimeRef.current = currentTime;
    // Calculate the zoom speed based on the time since the last event
    // The trackpad has a much faster zoom speed than the mouse wheel
    const zoomSpeed = ZOOM_SPEED / timeSinceLastEvent;
    const matrix = displayMatrix$.getValue();

    // Calculate new total scale with limits
    const scaleFactor = 1 - event.deltaY * zoomSpeed;
    const oldScale = getScale(matrix)[0];
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, oldScale * scaleFactor));
    scaleSvgAtGlobalPoint(vec2.fromValues(event.clientX, event.clientY), newScale);
  };

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);
  
  return { handleWheel };
};

export const GearProject: React.FC = () => {
  const dispatch = useAppDispatch();
  const gearProjectModule = useAppSelector((state) => state.module.value);
  const gears = useAppSelector(selectAllUserGears);
  const { ref: wheelDragRef, deltaMatrix$ } = useWheelDrag();
  const { ref: dragHandleRef, deltaMatrix$: dragHandleDeltaMatrix$, dragState } = useDrag({ middleButton: true });
  const svgRef = useRef<SVGSVGElement>(null);
  const ref = useMergedRef(wheelDragRef, dragHandleRef, svgRef);

  useEffect(() => {
    const subscription = deltaMatrix$.subscribe((matrix) => {
      const displayMatrix = displayMatrix$.getValue();
      mat3.multiply(displayMatrix, matrix, displayMatrix);
      dispatch(persistDisplayMatrix(mat3ToMatrix(displayMatrix)));
    });
    return () => subscription.unsubscribe();
  }, [deltaMatrix$, dispatch]);

  useEffect(() => {
    const subscription = dragHandleDeltaMatrix$.subscribe((matrix) => {
      const displayMatrix = displayMatrix$.getValue();
      mat3.multiply(displayMatrix, matrix, displayMatrix);
      dispatch(persistDisplayMatrix(mat3ToMatrix(displayMatrix)));
    });
    return () => subscription.unsubscribe();
  }, [dragHandleDeltaMatrix$, dispatch]);

  const updateViewBox = useCallback((viewBox: ViewBox) => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);
  }, [svgRef]);

  useEffect(() => {
    const subscription = globalViewBox$.subscribe(updateViewBox);
    return () => subscription.unsubscribe();
  }, [updateViewBox]);

  const { handleWheel: handleZoomWheel } = useZoom();
  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    if (event.ctrlKey) {
      handleZoomWheel(event);
    }
  }

  const editorMachineActor = useAppSelector(editorMachineSelector);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  const state = useSelector(editorMachineActor, (state) => state);

  const activeGear = useAppSelector((state) => activeGearId ? selectGearById(state, activeGearId) : null);
  useModeHotKeys();

  const handleExportViewBoxDragHandleDragEnd = useCallback(() => {
    dispatch(persistViewBox(viewBox$.getValue()));
  }, [dispatch]);

  useDeleteGear();

  return (
    <>
      <svg 
        id={__internal_gear_project_id__}
        ref={ref}
        onWheel={handleWheel}
        width='100vw'
        height='100vh'
        xmlns="http://www.w3.org/2000/svg" 
        style={{
          cursor: dragState.isDragging ? 'grabbing' : 'default',
          overflow: 'hidden',
          position: 'fixed',
          // background: theme.colors.gameMain[2],
          top: 0,
          left: 0,
        }}
      >
        <defs>
          <ExportViewBoxFilter filterId={__internal_export_view_box_filter_filter_id__} maskId={__internal_export_view_box_filter_mask_id__} />
        </defs>
        <GlobalViewBoxBackground />
        {!state.matches('ViewportSetting') && <ExportViewBoxController key={__internal_view_box_controller_id__} id={__internal_view_box_controller_id__} />}
        <g filter={`url(#${__internal_export_view_box_filter_filter_id__})`} mask={`url(#${__internal_export_view_box_filter_mask_id__})`}>
          {/* <GearProjectItem gearId={gearProject.rootGearId} rootPosition={gearProject.rootGearPosition} /> */}
          {/* {gearProject.gears.map(gear => <GearParser key={gear.id} gearId={gear.id} />)} */}
          {gears.map(gear => <GearParser key={gear.id} gearId={gear.id} />)}
          {state.matches({ Selecting: { GearSelected: "AddingGear" } }) && <GearToAdd />}
        </g>
        {activeGear && <CrossHair radius={activeGear.teeth * gearProjectModule / 2} />}
        {state.matches('ViewportSetting') && <ExportViewBoxController key={__internal_view_box_controller_id__} id={__internal_view_box_controller_id__} />}
        {state.matches('ViewportSetting') && <>
          <DragHandle handleSvgPosition$={viewBoxA$} onPositionChange={(pos) => viewBoxNext({ x1: pos[0], y1: pos[1] })} onDragEnd={handleExportViewBoxDragHandleDragEnd} />
          <DragHandle handleSvgPosition$={viewBoxB$} onPositionChange={(pos) => viewBoxNext({ x2: pos[0], y2: pos[1] })} onDragEnd={handleExportViewBoxDragHandleDragEnd} />
          <DragHandle handleSvgPosition$={viewBoxC$} onPositionChange={(pos) => viewBoxNext({ x1: pos[0], y2: pos[1] })} onDragEnd={handleExportViewBoxDragHandleDragEnd} />
          <DragHandle handleSvgPosition$={viewBoxD$} onPositionChange={(pos) => viewBoxNext({ x2: pos[0], y1: pos[1] })} onDragEnd={handleExportViewBoxDragHandleDragEnd} />
        </>}
        {activeGearId && <ActiveGearHandle />}
      </svg>
      <GearSettingPanel />
      <ToolsPanel />
      <GearProjectMenu />
      <Controller />
    </>
  )
}

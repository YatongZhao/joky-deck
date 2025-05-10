"use client"
import { useEffect, useState, useRef, useCallback } from "react";
import { GearProjectData } from "./core/types";
import { useGear, useGearProjectStore, svgMatrix$, finalMatrix$, viewBoxA$, viewBoxB$, viewBoxC$, viewBoxD$, useInitialTranslateMatrix$ } from "./store";
import { GearProjectItem } from "./GearProjectItem";
import { DropZoneContainer } from "./DropZoneContainer";
import { GearSettingPanel } from "./GearSettingPanel";
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
// import { useTheme } from "./theme";
import { useSelector } from "@xstate/react";
import { getGearProjectDataFromLocalStorage } from "./store/localStorage";
import { ActiveGearHandle } from "./ActiveGearHandle";
import { GearProjectMenu } from "./reactionLayer/GearProjectMenu";
import { Controller } from "./reactionLayer/Controller";
import { MAX_SCALE, scaleSvgAtGlobalPoint } from "./reactionLayer/hooks/useScaleController";
import { MIN_SCALE } from "./reactionLayer/hooks/useScaleController";

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
    const matrix = svgMatrix$.getValue();

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

const useInitializeGearProject = () => {
  const setGearProject = useGearProjectStore((state) => state.setGearProject);
  const resetUndoRedoManager = useGearProjectStore((state) => state.resetUndoRedoManager);
  useEffect(() => {
    const localStorageGearProjectData = getGearProjectDataFromLocalStorage();
    if (localStorageGearProjectData) {
      setGearProject(localStorageGearProjectData);
      resetUndoRedoManager();
    }
  }, [setGearProject, resetUndoRedoManager]);
}

export const GearProject: React.FC = () => {
  useInitializeGearProject();
  useInitialTranslateMatrix$();

  const __internal_gear_project_id__ = useGearProjectStore((state) => state.__internal_gear_project_id__);
  const gearProject = useGearProjectStore((state) => state.gearProject);
  const { ref: wheelDragRef, deltaMatrix$ } = useWheelDrag();
  const { ref: dragHandleRef, deltaMatrix$: dragHandleDeltaMatrix$, dragState } = useDrag({ middleButton: true });
  const svgRef = useRef<SVGSVGElement>(null);
  const ref = useMergedRef(wheelDragRef, dragHandleRef, svgRef);

  useEffect(() => {
    const subscription = deltaMatrix$.subscribe((matrix) => {
      const svgMatrix = svgMatrix$.getValue();
      mat3.multiply(svgMatrix, matrix, svgMatrix);
      svgMatrix$.next(svgMatrix);
    });
    return () => subscription.unsubscribe();
  }, [deltaMatrix$]);

  useEffect(() => {
    const subscription = dragHandleDeltaMatrix$.subscribe((matrix) => {
      const svgMatrix = svgMatrix$.getValue();
      mat3.multiply(svgMatrix, matrix, svgMatrix);
      svgMatrix$.next(svgMatrix);
    });
    return () => subscription.unsubscribe();
  }, [dragHandleDeltaMatrix$]);

  const updateViewBox = useCallback((finalMatrix: mat3) => {
    const svg = svgRef.current;
    if (!svg) return;

    const windowInnerWidth = window.innerWidth;
    const windowInnerHeight = window.innerHeight;

    const matrixInverse = mat3.create();
    mat3.invert(matrixInverse, finalMatrix);

    const scale = Math.hypot(finalMatrix[0], finalMatrix[1]);
    svg.setAttribute('viewBox', vec2.transformMat3(vec2.create(), vec2.fromValues(0, 0), matrixInverse).join(' ')
    + ` ${windowInnerWidth / scale} ${windowInnerHeight / scale}`);
  }, [svgRef]);

  useEffect(() => {
    const subscription = finalMatrix$.subscribe(updateViewBox);
    return () => subscription.unsubscribe();
  }, [updateViewBox]);

  const { handleWheel: handleZoomWheel } = useZoom();
  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    if (event.ctrlKey) {
      handleZoomWheel(event);
    }
  }
  const setGearProject = useGearProjectStore((state) => state.setGearProject);
  const resetUndoRedoManager = useGearProjectStore((state) => state.resetUndoRedoManager);
  const pushUndo = useGearProjectStore((state) => state.pushUndo);

  const editorMachineActor = useGearProjectStore((state) => state.editorMachineActor);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  const state = useSelector(editorMachineActor, (state) => state);

  const activeGear = useGear(activeGearId);
  useModeHotKeys();

  const handleLoadProject = (gearProject: GearProjectData) => {
    setGearProject(gearProject);
    resetUndoRedoManager();
  }

  const handleExportViewBoxDragHandleDragEnd = useCallback(() => {
    pushUndo('Export View Box Changed');
  }, [pushUndo]);

  return (
    <>
      <DropZoneContainer<GearProjectData> onJsonLoad={handleLoadProject} title="Drop a gear project here">
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
          {!state.matches('ViewportSetting') && <ExportViewBoxController key="export-view-box-controller" id="export-view-box-controller" />}
          <GearProjectItem gearId={gearProject.rootGearId} rootPosition={gearProject.rootGearPosition} />
          {activeGear && <CrossHair radius={activeGear.teeth * gearProject.module / 2} />}
          {state.matches('ViewportSetting') && <ExportViewBoxController key="export-view-box-controller" id="export-view-box-controller" />}
          {state.matches('ViewportSetting') && <>
            <DragHandle targetSvgPosition$={viewBoxA$} onDragEnd={handleExportViewBoxDragHandleDragEnd} />
            <DragHandle targetSvgPosition$={viewBoxB$} onDragEnd={handleExportViewBoxDragHandleDragEnd} />
            <DragHandle targetSvgPosition$={viewBoxC$} onDragEnd={handleExportViewBoxDragHandleDragEnd} />
            <DragHandle targetSvgPosition$={viewBoxD$} onDragEnd={handleExportViewBoxDragHandleDragEnd} />
          </>}
          {activeGearId && <ActiveGearHandle />}
        </svg>
      </DropZoneContainer>
      <GearSettingPanel />
      <ToolsPanel />
      <GearProjectMenu />
      <Controller />
    </>
  )
}

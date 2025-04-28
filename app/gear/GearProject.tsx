"use client"
import { useEffect, useState, useRef, useCallback } from "react";
import { GearProjectData } from "./core/types.";
import { useGear, useGearProjectStore } from "./store";
import { GearProjectItem } from "./GearProjectItem";
import { ReactionPanel } from "./ReactionPanel";
import { DropZoneContainer } from "./DropZoneContainer";
import { GearSettingPanel } from "./GearSettingPanel";
import { useModeHotKeys } from "./hooks/useMode";
import { CrossHair } from "./CrossHair";
import { ExportViewBoxController } from "./ExportViewBoxController";
import { mat3, vec2 } from "gl-matrix";
import { getScale, scaleAtPoint } from "./core/coordinate";
import { ToolsPanel } from "./ToolsPanel";
import { EditorMachineContext } from "./editorMachine";

interface DragState {
  isDragging: boolean;
}

const useDrag = () => {
  const [dragState, setDragState] = useState<DragState>({ isDragging: false });
  const svgMatrix$ = useGearProjectStore((state) => state.svgMatrix$);
  const setSvgMatrix = useGearProjectStore((state) => state.setSvgMatrix);

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    if (event.button === 1) { // Middle mouse button
      event.preventDefault();
      setDragState({ isDragging: true });
    }
  };

  const translate = useCallback(([x, y]: [number, number]) => {
    const matrix = svgMatrix$.getValue();
    const translateMatrix = mat3.create();
    mat3.translate(translateMatrix, translateMatrix, [x, y]);
    mat3.multiply(matrix, translateMatrix, matrix);
    setSvgMatrix(matrix);
  }, [svgMatrix$, setSvgMatrix]);

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!dragState.isDragging) return;
    translate([event.movementX, event.movementY]);
  };

  const handleMouseUp = () => {
    setDragState({ isDragging: false });
  };

  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    translate([event.deltaX, event.deltaY]);
  }

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
    }
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return {
    dragState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
  };
};

const useZoom = () => {
  const MIN_SCALE = 0.05;
  const MAX_SCALE = 30;
  const ZOOM_SPEED = 0.05;
  const lastEventTimeRef = useRef<number>(0);
  const svgMatrix$ = useGearProjectStore((state) => state.svgMatrix$);
  const setSvgMatrix = useGearProjectStore((state) => state.setSvgMatrix);
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
    const newTotalScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, oldScale * scaleFactor));
    
    // Calculate the scale change
    const newScale = newTotalScale / oldScale;
    const scaleMatrix = mat3.create();
    scaleAtPoint(scaleMatrix, vec2.fromValues(event.clientX, event.clientY), newScale);
    mat3.multiply(matrix, scaleMatrix, matrix);
    setSvgMatrix(matrix);
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
  const gearProject = useGearProjectStore((state) => state.gearProject);
  const svgRef = useRef<SVGSVGElement>(null);
  const svgMatrix$ = useGearProjectStore((state) => state.svgMatrix$);

  const updateViewBox = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const matrix = svgMatrix$.getValue();
    const matrixInverse = mat3.create();
    mat3.invert(matrixInverse, matrix);

    const windowInnerWidth = window.innerWidth;
    const windowInnerHeight = window.innerHeight;

    const scale = Math.hypot(matrix[0], matrix[1]);
    svg.setAttribute('viewBox', vec2.transformMat3(vec2.create(), vec2.fromValues(0, 0), matrixInverse).join(' ')
    + ` ${windowInnerWidth / scale} ${windowInnerHeight / scale}`);
  }, [svgMatrix$]);

  useEffect(() => {
    const subscription = svgMatrix$.subscribe(updateViewBox);
    return () => subscription.unsubscribe();
  }, [svgMatrix$, updateViewBox]);

  useEffect(() => {
    updateViewBox();
    window.addEventListener('resize', updateViewBox);
    return () => window.removeEventListener('resize', updateViewBox);
  }, [updateViewBox]);

  const { dragState, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel: handleDragWheel } = useDrag();
  const { handleWheel: handleZoomWheel } = useZoom();

  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    if (event.ctrlKey) {
      handleZoomWheel(event);
    } else {
      handleDragWheel(event);
    }
  }
  const setGearProject = useGearProjectStore((state) => state.setGearProject);

  const activeGearId = EditorMachineContext.useSelector((state) => state.context.selectedGearId);

  const activeGear = useGear(activeGearId);
  useModeHotKeys();
  console.log('rerender');

  return (
    <>
      <DropZoneContainer<GearProjectData> onJsonLoad={setGearProject} title="Drop a gear project here">
        <svg 
          ref={svgRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          width='100vw'
          height='100vh'
          xmlns="http://www.w3.org/2000/svg" 
          style={{
            cursor: dragState.isDragging ? 'grabbing' : 'default',
            overflow: 'hidden',
            position: 'fixed',
            top: 0,
            left: 0,
          }}
        >
          <GearProjectItem gearId={gearProject.rootGearId} />
          <ExportViewBoxController />
          {activeGear && <CrossHair radius={activeGear.teeth * gearProject.module / 2} />}
        </svg>
      </DropZoneContainer>
      <ReactionPanel svgRef={svgRef} />
      <GearSettingPanel />
      <ToolsPanel />
    </>
  )
}

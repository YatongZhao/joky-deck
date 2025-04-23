"use client"
import { useEffect, useState, useMemo } from "react";
import { GearData, GearProjectData } from "./core/types.";
import { GearProjectProvider } from "./context";
import { GearProjectItem } from "./GearProjectItem";

interface ViewBoxState {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
}

const useDrag = (viewBox: ViewBoxState, onViewBoxPositionChange: (newViewBoxPosition: { left: number; top: number }) => void) => {
  const [dragState, setDragState] = useState<DragState>({ isDragging: false, startX: 0, startY: 0 });

  const handleMouseDown = (event: React.MouseEvent<SVGSVGElement>) => {
    if (event.button === 1) { // Middle mouse button
      event.preventDefault();
      setDragState({ isDragging: true, startX: event.clientX, startY: event.clientY });
    }
  };

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!dragState.isDragging) return;

    const dx = event.clientX - dragState.startX;
    const dy = event.clientY - dragState.startY;

    onViewBoxPositionChange({
      left: viewBox.left - dx * (viewBox.width / event.currentTarget.clientWidth),
      top: viewBox.top - dy * (viewBox.height / event.currentTarget.clientWidth)
    });

    setDragState({ ...dragState, startX: event.clientX, startY: event.clientY });
  };

  const handleMouseUp = () => {
    setDragState({ ...dragState, isDragging: false });
  };

  return {
    dragState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  };
};

const useZoom = (
  viewBox: ViewBoxState,
  onViewBoxPositionChange: (newViewBoxPosition: { left: number; top: number }) => void,
  scale: number,
  setScale: (newScale: number) => void,
) => {
  const MAX_SCALE = 0.05; // This is actually the minimum zoom level (most zoomed out)
  const MIN_SCALE = 30;   // This is actually the maximum zoom level (most zoomed in)
  const ZOOM_SPEED = 0.002;

  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    if (!event.ctrlKey) return;
    
    const svgRect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;
    
    // Calculate the mouse position in SVG coordinates
    const svgX = (mouseX / svgRect.width) * viewBox.width + viewBox.left;
    const svgY = (mouseY / svgRect.height) * viewBox.height + viewBox.top;
    
    // Calculate new total scale with limits
    const scaleFactor = 1 + event.deltaY * ZOOM_SPEED;
    const newTotalScale = Math.max(MAX_SCALE, Math.min(MIN_SCALE, scale * scaleFactor));
    
    // Calculate the scale change
    const newScale = newTotalScale / scale;
    
    // Calculate the offset to keep the mouse point fixed
    const offsetX = (svgX - viewBox.left) * (1 - newScale);
    const offsetY = (svgY - viewBox.top) * (1 - newScale);
    
    onViewBoxPositionChange({
      left: viewBox.left + offsetX,
      top: viewBox.top + offsetY,
    });
    
    setScale(newTotalScale);
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

type GearProjectProps = {
  gearProject: GearProjectData;
  addGear: (gear: GearData) => void;
};

export const GearProject: React.FC<GearProjectProps> = ({ gearProject, addGear }) => {
  const [scale, setScale] = useState(1);
  const [baseViewBoxSize, setBaseViewBoxSize] = useState<{ width: number, height: number }>({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [viewBoxPosition, setViewBoxPosition] = useState<{ left: number; top: number }>({
    left: 0,
    top: 0,
  });
  const viewBox = useMemo(() => ({
    left: viewBoxPosition.left,
    top: viewBoxPosition.top,
    width: baseViewBoxSize.width * scale,
    height: baseViewBoxSize.height * scale
  }), [viewBoxPosition, baseViewBoxSize, scale]);


  useEffect(() => {
    const updateDimensions = () => {
      setBaseViewBoxSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Initial update
    updateDimensions();

    // Add resize listener
    window.addEventListener('resize', updateDimensions);

    // Cleanup
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { dragState, handleMouseDown, handleMouseMove, handleMouseUp } = useDrag(viewBox, setViewBoxPosition);
  const { handleWheel } = useZoom(viewBox, setViewBoxPosition, scale, setScale);

  return (
    <GearProjectProvider gearProject={gearProject} addGear={addGear} scale={scale}>
      <svg 
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        width='100vw'
        height='100vh'
        xmlns="http://www.w3.org/2000/svg" 
        viewBox={`${viewBox.left} ${viewBox.top} ${viewBox.width} ${viewBox.height}`}
        style={{
          cursor: dragState.isDragging ? 'grabbing' : 'default',
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
        }}
      >
        <GearProjectItem gearId={gearProject.rootGear.id} isRoot />
      </svg>
    </GearProjectProvider>
  )
}

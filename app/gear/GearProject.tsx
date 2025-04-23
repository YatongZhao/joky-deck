import { useEffect, useState } from "react";
import { GearProjectData } from "./core/types.";
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

const useDrag = (viewBox: ViewBoxState, onViewBoxChange: (newViewBox: ViewBoxState) => void) => {
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

    onViewBoxChange({
      ...viewBox,
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

const useZoom = (viewBox: ViewBoxState, onViewBoxChange: (newViewBox: ViewBoxState) => void) => {
  const [totalScale, setTotalScale] = useState(1);

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 30;
  const ZOOM_SPEED = 0.005;

  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    if (!event.ctrlKey) return;
    
    const svgRect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;
    
    // Calculate the mouse position in SVG coordinates
    const svgX = (mouseX / svgRect.width) * viewBox.width + viewBox.left;
    const svgY = (mouseY / svgRect.height) * viewBox.height + viewBox.top;
    
    // Calculate new total scale with limits
    const newTotalScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, totalScale + event.deltaY * ZOOM_SPEED));
    const scale = newTotalScale / totalScale;
    
    // Calculate new viewBox dimensions
    const newWidth = viewBox.width * scale;
    const newHeight = viewBox.height * scale;
    
    // Calculate new viewBox position to keep mouse point fixed
    const newLeft = svgX - (mouseX / svgRect.width) * newWidth;
    const newTop = svgY - (mouseY / svgRect.height) * newHeight;
    
    onViewBoxChange({
      left: newLeft,
      top: newTop,
      width: newWidth,
      height: newHeight
    });
    
    setTotalScale(newTotalScale);
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
  width: number;
  height: number;

  gearProject: GearProjectData;
};

export const GearProject: React.FC<GearProjectProps> = ({ width, height, gearProject }) => {
  const [viewBox, setViewBox] = useState<ViewBoxState>({
    left: 0,
    top: 0,
    width,
    height
  });

  // Update viewBox when width/height props change
  useEffect(() => {
    setViewBox(prev => {
      // Calculate the scale factor for the new dimensions
      const scaleX = width / prev.width;
      const scaleY = height / prev.height;
      
      // Adjust the left and top to keep content fixed relative to top-left
      const newLeft = prev.left * scaleX;
      const newTop = prev.top * scaleY;
      
      return {
        left: newLeft,
        top: newTop,
        width,
        height
      };
    });
  }, [width, height]);

  const { dragState, handleMouseDown, handleMouseMove, handleMouseUp } = useDrag(viewBox, setViewBox);
  const { handleWheel } = useZoom(viewBox, setViewBox);

  return (
    <GearProjectProvider gearProject={gearProject}>
      <svg 
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg" 
        viewBox={`${viewBox.left} ${viewBox.top} ${viewBox.width} ${viewBox.height}`}
        style={{ cursor: dragState.isDragging ? 'grabbing' : 'default' }}
      >
        <GearProjectItem gearId={gearProject.rootGear.id} isRoot />
      </svg>
    </GearProjectProvider>
  )
}

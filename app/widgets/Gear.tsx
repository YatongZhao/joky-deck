import React, { useEffect, useState } from "react"
import { generateGearPath, calculateGearInfo, GEARS_10 } from "../utils/gear";
import { MantineColorsTuple } from "@mantine/core";
import { memoizeWith } from "ramda";

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

export const GearGroupContainer: React.FC<{ children: React.ReactNode, width: number, height: number }> = ({ children, width, height }) => {
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
      {children}
    </svg>
  )
}

const memorizedGearPath = memoizeWith((gearParams) => `${gearParams.teeth}-${gearParams.module}-${gearParams.pressureAngleDeg}-${gearParams.resolution}`, generateGearPath);

const getGearTransform = (positionAngle: number, toothPitch: number) => {
  const x = Math.cos(positionAngle / 180 * Math.PI) * toothPitch;
  const y = Math.sin(positionAngle / 180 * Math.PI) * toothPitch;
  return `translate(${x}, ${y})`;
};

const parentGearContext = React.createContext<{
  teeth: number;
  module: number;
  direction: 1 | -1;
  initAngle: number;
} | null>(null);

const useParentGear = () => {
  return React.useContext(parentGearContext);
};

export const Gear: React.FC<{
  color: string;
  hoverColor: string;
  teeth: number;
  module: number;
  children?: React.ReactNode;
  durationUnit?: number;
  positionAngle?: number;
  direction?: 1 | -1;
}> = ({ color, hoverColor, teeth, module, children, durationUnit = 1, positionAngle = 0, direction = 1 }) => {
  const parentGear = useParentGear();
  const [hovered, setHovered] = useState(false);

  const currentDirection = (parentGear ? -parentGear.direction : direction) as (1 | -1);
  const currentInitAngle = parentGear
    ? -parentGear.initAngle * parentGear.teeth / teeth + currentDirection * (180) % (360 / teeth) + 180 / teeth + positionAngle * (parentGear.teeth + teeth) / teeth
    : 0;
  
  const duration = durationUnit * teeth;
  const begin = -(currentInitAngle) / 360 * duration * currentDirection - duration;

  return <g transform={parentGear ? getGearTransform(positionAngle, (parentGear.teeth * parentGear.module + teeth * module) / 2) : ''}>
    <path
      d={memorizedGearPath(calculateGearInfo(teeth, module))}
      fill={hovered ? hoverColor : color}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <animateTransform attributeName="transform" type="rotate" begin={`${begin}s`} from="0" to={`${360 * currentDirection}`} dur={`${duration}s`} repeatCount="indefinite" />
    </path>
    <parentGearContext.Provider value={{ teeth, module, direction: currentDirection, initAngle: currentInitAngle }}>
      {children}
    </parentGearContext.Provider>
  </g>
}

export const GearGroup: React.FC<{ colors: MantineColorsTuple, width: number, height: number }> = ({ colors, width, height }) => {
  return (
    <GearGroupContainer width={width} height={height}>
      <g transform="translate(60, 160)">
        <path d={generateGearPath(GEARS_10[6])} fill={colors[3]}>
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="12s" repeatCount="indefinite" />
        </path>
        <g transform="translate(60, 0)">
          <path d={generateGearPath(GEARS_10[6])} fill={colors[2]}>
            <animateTransform attributeName="transform" type="rotate" begin="-2s" from="0" to="-360" dur="12s" repeatCount="indefinite" />
          </path>
          <g transform="translate(0, 90)">
            <path d={generateGearPath(GEARS_10[12])} fill={colors[4]}>
              <animateTransform attributeName="transform" type="rotate" begin="-2s" from="0" to="360" dur="24s" repeatCount="indefinite" />
            </path>
            <g transform="translate(150, 0)">
              <path d={generateGearPath(GEARS_10[18])} fill={colors[2]}>
                <animateTransform attributeName="transform" type="rotate" begin="1s" from="0" to="-360" dur="36s" repeatCount="indefinite" />
              </path>
              <g transform="translate(0, -120)">
                <path d={generateGearPath(GEARS_10[6])} fill={colors[3]}>
                  <animateTransform attributeName="transform" type="rotate" begin="1s" from="0" to="360" dur="12s" repeatCount="indefinite" />
                </path>
              </g>
              <g transform="translate(0, 210)">
                <path d={generateGearPath(GEARS_10[24])} fill={colors[3]}>
                  <animateTransform attributeName="transform" type="rotate" begin="1s" from="0" to="360" dur="48s" repeatCount="indefinite" />
                </path>
              </g>
            </g>
          </g>
        </g>
      </g>
    </GearGroupContainer>
  )
}

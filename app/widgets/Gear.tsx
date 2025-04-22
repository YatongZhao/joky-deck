import React, { useEffect, useState } from "react"
import { generateGearPath, calculateGearInfo, GEARS_10 } from "../utils/gear";
import { MantineColorsTuple } from "@mantine/core";
import { memoizeWith } from "ramda";

export const GearGroupContainer: React.FC<{ children: React.ReactNode, width: number }> = ({ children, width }) => {
  const [viewBoxLeft, setViewBoxLeft] = useState(0);
  const [viewBoxTop, setViewBoxTop] = useState(0);
  const [viewBoxWidth, setViewBoxWidth] = useState(500);
  const [viewBoxHeight, setViewBoxHeight] = useState(600);
  const [totalScale, setTotalScale] = useState(1);

  const MIN_SCALE = 0.5;
  const MAX_SCALE = 3;
  const ZOOM_SPEED = 0.001;

  const handleWheel = (event: React.WheelEvent<SVGSVGElement>) => {
    if (!event.ctrlKey) return;
    
    // Calculate the mouse position in SVG coordinates
    const svgRect = event.currentTarget.getBoundingClientRect();
    const mouseX = event.clientX - svgRect.left;
    const mouseY = event.clientY - svgRect.top;
    
    // Convert mouse position to SVG viewBox coordinates
    const svgX = (mouseX / width) * viewBoxWidth + viewBoxLeft;
    const svgY = (mouseY / width) * viewBoxHeight + viewBoxTop;
    
    // Calculate new total scale with limits
    const newTotalScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, totalScale + event.deltaY * ZOOM_SPEED));
    const scale = newTotalScale / totalScale;
    
    // Calculate new viewBox dimensions
    const newWidth = viewBoxWidth * scale;
    const newHeight = viewBoxHeight * scale;
    
    // Calculate new viewBox position to keep mouse point fixed
    const newLeft = svgX - (mouseX / width) * newWidth;
    const newTop = svgY - (mouseY / width) * newHeight;
    
    setViewBoxLeft(newLeft);
    setViewBoxTop(newTop);
    setViewBoxWidth(newWidth);
    setViewBoxHeight(newHeight);
    setTotalScale(newTotalScale);
  }

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

  return (
    <svg 
      onWheel={handleWheel}
      width={width} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox={`${viewBoxLeft} ${viewBoxTop} ${viewBoxWidth} ${viewBoxHeight}`}
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

export const GearGroup: React.FC<{ colors: MantineColorsTuple, width: number }> = ({ colors, width }) => {
  return (
    <GearGroupContainer width={width}>
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

import React, { forwardRef, useState } from "react"
import { calculateGearInfo, getGearTransform, memorizedGearPath } from "./core/gear";
import { useTheme } from "@/app/theme";

const parentGearContext = React.createContext<{
  teeth: number;
  module: number;
  direction: 1 | -1;
  initAngle: number;
} | null>(null);

const useParentGear = () => {
  return React.useContext(parentGearContext);
};

export const Gear = forwardRef<SVGPathElement, {
  teeth: number;
  children?: React.ReactNode;
  positionAngle?: number;
  direction?: 1 | -1;
  module: number;
  durationUnit: number;

  onClick?: () => void;
  active?: boolean;
}>(function Gear({ teeth, children, positionAngle = 0, direction = 1, module, durationUnit, onClick, active = false }, ref) {
  const parentGear = useParentGear();
  const [hovered, setHovered] = useState(false);
  const theme = useTheme();


  const currentDirection = (parentGear ? -parentGear.direction : direction) as (1 | -1);
  const currentInitAngle = parentGear
    ? -parentGear.initAngle * parentGear.teeth / teeth + currentDirection * (180) % (360 / teeth) + 180 / teeth + positionAngle * (parentGear.teeth + teeth) / teeth
    : 0;
  
  const duration = durationUnit * teeth;
  const begin = -(currentInitAngle) / 360 * duration * currentDirection - duration;

  return <g transform={parentGear ? getGearTransform(positionAngle, (parentGear.teeth * parentGear.module + teeth * module) / 2) : ''}>
    <path
      ref={ref}
      d={memorizedGearPath(calculateGearInfo(teeth, module))}
      fill={active ? theme.colors.blue[4] : theme.colors.gray[4]}
      stroke={hovered ? 'black' : 'none'}
      strokeWidth={hovered ? 1 : 0}
      style={{ cursor: 'pointer' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <animateTransform attributeName="transform" type="rotate" begin={`${begin}s`} from="0" to={`${360 * currentDirection}`} dur={`${duration}s`} repeatCount="indefinite" />
    </path>
    <parentGearContext.Provider value={{ teeth, module: module, direction: currentDirection, initAngle: currentInitAngle }}>
      {children}
    </parentGearContext.Provider>
  </g>
});

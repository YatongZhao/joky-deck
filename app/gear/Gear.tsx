import React, { forwardRef, useState, useMemo } from "react"
import { calculateGearInfo, getGearTransformVector, memorizedGearHolePath, memorizedGearPath } from "./core/gear";
import { useTheme } from "@/app/theme";
import { mat3, vec2 } from "gl-matrix";

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
  id: string;
  teeth: number;
  children?: React.ReactNode;
  positionAngle?: number;
  direction?: 1 | -1;
  module: number;
  durationUnit: number;

  active?: boolean;
  
  rootPosition?: vec2;

  color?: string;

  onClick?: () => void;
  virtual?: boolean;
}>(function Gear({
  id,
  teeth,
  children,
  positionAngle = 0,
  direction = 1,
  module,
  durationUnit,
  onClick,
  virtual = false,
  active = false,
  color,
  rootPosition,
}, ref) {
  const parentGear = useParentGear();
  const [hovered, setHovered] = useState(false);
  const theme = useTheme();
  const fillColor = color || theme.colors.gray[4];
  const transformMatrix = useMemo(() => {
    if (rootPosition) {
      const result = mat3.create();
      mat3.translate(result, result, rootPosition);
      return result;
    }
    const result = mat3.create();
    if (!parentGear) return result;
    mat3.translate(result, result, getGearTransformVector(positionAngle, teeth, parentGear.teeth, module));
    return result;
  }, [parentGear, positionAngle, module, teeth, rootPosition]);

  const transform = useMemo(() => {
    const transformVec2 = vec2.create();
    vec2.transformMat3(transformVec2, transformVec2, transformMatrix);
    return `translate(${transformVec2.join(', ')})`;
  }, [transformMatrix]);

  const currentDirection = (parentGear ? -parentGear.direction : direction) as (1 | -1);
  const currentInitAngle = parentGear
    ? -parentGear.initAngle * parentGear.teeth / teeth + currentDirection * (180) % (360 / teeth) + 180 / teeth + positionAngle * (parentGear.teeth + teeth) / teeth
    : 0;
  
  const duration = durationUnit * teeth;
  const begin = useMemo(() => {
    let result = (-(currentInitAngle) / 360 * duration * currentDirection) % duration;
    if (result > 0) {
      result = result - duration;
    }
    // 0.1 is a hack to avoid the bug that the animation is not working when the begin is 0
    return result + 0.1;
  }, [currentInitAngle, currentDirection, duration]);

  return <g id={id} transform={transform}>
      <path
        ref={ref}
        d={`${memorizedGearPath(calculateGearInfo(teeth, module))} ${virtual ? '' : memorizedGearHolePath(teeth, module, 0.03)}`}
        fill={virtual ? theme.colors.blue[4] : fillColor}
        stroke={hovered || virtual || active ? theme.colors.dark[9] : 'none'}
        strokeWidth={1}
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={onClick}
        fillRule="evenodd"
      >
        <animateTransform attributeName="transform" type="rotate" begin={`${begin}s`} from="0" to={`${360 * currentDirection}`} dur={`${duration}s`} repeatCount="indefinite" />
      </path>
    <parentGearContext.Provider value={{ teeth, module, direction: currentDirection, initAngle: currentInitAngle }}>
      {children}
    </parentGearContext.Provider>
  </g>
});

import React from "react"
import { generateGearPath, calculateGearInfo, GEARS_10 } from "../utils/gear";
import { MantineColorsTuple } from "@mantine/core";
import { memoizeWith } from "ramda";

export const GearGroupContainer: React.FC<{ children: React.ReactNode, width: number }> = ({ children, width }) => {
  return (
    <svg width={width} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 600">
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
  teeth: number;
  module: number;
  children?: React.ReactNode;
  durationUnit?: number;
  positionAngle?: number;
  direction?: 1 | -1;
}> = ({ color, teeth, module, children, durationUnit = 1, positionAngle = 0, direction = 1 }) => {
  const parentGear = useParentGear();

  const currentDirection = (parentGear ? -parentGear.direction : direction) as (1 | -1);
  const currentInitAngle = parentGear
    ? -parentGear.initAngle * parentGear.teeth / teeth + currentDirection * (180) % (360 / teeth) + 180 / teeth + positionAngle * (parentGear.teeth + teeth) / teeth
    : 0;
  
  const duration = durationUnit * teeth;
  const begin = -(currentInitAngle) / 360 * duration * currentDirection - duration;

  return <g transform={parentGear ? getGearTransform(positionAngle, (parentGear.teeth * parentGear.module + teeth * module) / 2) : ''}>
    <path d={memorizedGearPath(calculateGearInfo(teeth, module))} fill={color}>
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

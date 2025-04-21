import React from "react"
import { generateGearPath, GEARS_10 } from "../utils/gear";
import { MantineColorsTuple } from "@mantine/core";

export const GearContainer: React.FC<{ children: React.ReactNode, width: number }> = ({ children, width }) => {
  return (
    <svg width={width} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 600">
      {children}
    </svg>
  )
}

export const Gear: React.FC<{ colors: MantineColorsTuple, width: number }> = ({ colors, width }) => {
  return (
    <GearContainer width={width}>
      <g transform="translate(60, 160)">
        <path d={generateGearPath(GEARS_10[6])} fill={colors[1]}>
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
    </GearContainer>
  )
}
import { forwardRef } from "react";
import { calculateGearInfo, memorizedGearHolePath, memorizedGearPath } from "./core/gear";
import { useTheme } from "../theme";
import { useHover, useMergedRef } from "@mantine/hooks";

export type GearEntityProps = {
  teeth: number;
  module: number;

  withHole: boolean;
  fillColor: string;
  active: boolean;
  onClick: () => void;
}

export const GearEntity = forwardRef<SVGPathElement, GearEntityProps>(function GearEntity({ teeth, module, withHole, fillColor, active, onClick }: GearEntityProps, ref) {
  const theme = useTheme();
  const { hovered, ref: hoverRef } = useHover();
  const mergedRef = useMergedRef(ref, hoverRef);

  return <path
    ref={mergedRef}
    d={`${memorizedGearPath(calculateGearInfo(teeth, module))} ${withHole ? memorizedGearHolePath(teeth, module, 0.03) : ''}`}
    fill={fillColor}
    stroke={hovered || active ? theme.colors.dark[9] : 'none'}
    strokeWidth={1}
    style={{ cursor: 'pointer' }}
    onClick={onClick}
    fillRule="evenodd"
  />
});

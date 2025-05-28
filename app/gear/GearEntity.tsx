import { forwardRef, useEffect, useMemo, useRef } from "react";
import { calculateGearInfo, memorizedGearHolePath, memorizedGearPath } from "./core/gear";
import { useTheme } from "../theme";
import { useHover, useMergedRef } from "@mantine/hooks";
import { selectGearById } from "./store/redux/slices/gearsSlice";
import { useAppSelector } from "./store/redux";
import { dynamicGearAngleMap } from "./store/dynamicGearPosition";
import { dynamicGearPositionMap } from "./store/dynamicGearPosition";
import { gsap } from "gsap";

export type GearEntityProps = {
  id: string;
  // teeth: number;
  // module: number;

  withHole: boolean;
  // fillColor: string;
  active: boolean;
  dimmed?: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const GearEntity = forwardRef<SVGPathElement, GearEntityProps>(function GearEntity({ 
  id, 
  withHole, 
  active, 
  dimmed = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: GearEntityProps, ref) {
  const gearData = useAppSelector((state) => selectGearById(state, id));
  const gearProjectModule = useAppSelector((state) => state.module.value);
  const { teeth = 0, color } = gearData ?? {};
  const theme = useTheme();
  const { hovered, ref: hoverRef } = useHover();
  const pathRef = useRef<SVGPathElement>(null);
  const mergedRef = useMergedRef(ref, hoverRef, pathRef);
  const filterRef = useRef<SVGFilterElement>(null);
  const colorMatrixRef = useRef<SVGFEColorMatrixElement>(null);

  // Create filter ID unique to this gear
  const filterId = useMemo(() => `dimmed-filter-${id}`, [id]);

  const d = useMemo(() => {
    return `${memorizedGearPath(calculateGearInfo(teeth, gearProjectModule))} ${withHole ? memorizedGearHolePath(teeth, gearProjectModule, 0.03) : ''}`;
  }, [teeth, gearProjectModule, withHole]);

  // Handle dimmed state changes with GSAP
  useEffect(() => {
    if (!colorMatrixRef.current) return;

    const targetOpacity = dimmed ? 0.2 : 1;
    gsap.to(colorMatrixRef.current, {
      attr: {
        values: `1 0 0 0 0
                 0 1 0 0 0
                 0 0 1 0 0
                 0 0 0 ${targetOpacity} 0`
      },
      duration: 0.3,
      ease: "power2.inOut"
    });
  }, [dimmed]);

  useEffect(() => {
    const tickerCallback = () => {
      const position = dynamicGearPositionMap.get(id);
      const angle = dynamicGearAngleMap.get(id);
      if (!position) return;
      if (!pathRef.current) return;
      pathRef.current.setAttribute('transform', `translate(${position[0]}, ${position[1]}) rotate(${angle})`);
      pathRef.current.setAttribute('d', d);
    }
    gsap.ticker.add(tickerCallback);
    return () => gsap.ticker.remove(tickerCallback);
  }, [id, d]);

  return (
    <>
      <defs>
        <filter id={filterId} ref={filterRef}>
          <feColorMatrix
            ref={colorMatrixRef}
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
            result="semiTransparent"
          />
          <feComposite
            in="semiTransparent"
            in2="SourceGraphic"
            operator="in"
            result="final"
          />
        </filter>
      </defs>
      <path
        ref={mergedRef}
        fill={color || theme.colors.gray[4]}
        stroke={hovered || active ? theme.colors.dark[9] : 'none'}
        strokeWidth={1}
        style={{ 
          cursor: 'pointer',
          transition: 'stroke 0.2s ease-in-out',
        }}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        fillRule="evenodd"
        filter={`url(#${filterId})`}
      />
    </>
  );
});

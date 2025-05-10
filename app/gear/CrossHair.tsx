import { useEffect, useRef } from "react";
import { rotatePoint } from "./core/gear";
import { useGearSvgPosition, useGearProjectStore } from "./store";
import { useSelector } from "@xstate/react";

const drawCrossHair = (radius: number) => {
  let path = '';
  const drawRadius = radius + 10;

  const pointerPath: [number, number][] = [
    [0, drawRadius],
    [-3, drawRadius + 9],
    [0, drawRadius + 6],
    [3, drawRadius + 9],
  ] 
  for (let i = 0; i < 3; i++) {
    path += `M ${pointerPath.map(point => rotatePoint(point, i * 2 * Math.PI / 3)).map(([x, y]) => `${x},${y}`).join(' L ')} Z`
  }

  return path;
}

export const CrossHair: React.FC<{ radius: number }> = ({ radius }) => {
  const editorMachineActor = useGearProjectStore((state) => state.editorMachineActor);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  const gRef = useRef<SVGGElement>(null);
  const activeGearPosition = useGearSvgPosition(activeGearId);

  useEffect(() => {
    if (!gRef.current) return;
    gRef.current.setAttribute('transform', `translate(${activeGearPosition[0]}, ${activeGearPosition[1]})`);
  }, [activeGearPosition]);
  return (
    <g ref={gRef}>
      <path d={drawCrossHair(radius)}>
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur={`10s`}
          repeatCount="indefinite"
          />
      </path>
    </g>
  )
}

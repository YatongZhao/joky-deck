import { useEffect, useRef } from "react";
import { rotatePoint } from "./core/gear";
import { useSelector } from "@xstate/react";
import { useAppSelector } from "./store/redux";
import { editorMachineSelector } from "./store/redux/slices/editorMachineSlice";
import { gsap } from "gsap";
import { dynamicGearPositionMap } from "./store/dynamicGearPosition";
import { vec2 } from "gl-matrix";

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
  const editorMachineActor = useAppSelector(editorMachineSelector);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  const gRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const tickerHandler = () => {
      if (!gRef.current) return;
      const position = activeGearId ? dynamicGearPositionMap.get(activeGearId) ?? vec2.create() : vec2.create();
      gRef.current.setAttribute('transform', `translate(${position[0]}, ${position[1]})`);
    }
    gsap.ticker.add(tickerHandler);
    return () => gsap.ticker.remove(tickerHandler);
  }, [activeGearId]);
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

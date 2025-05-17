import { useEffect, useRef } from "react";
import { rotatePoint } from "./core/gear";
import { useGear, useGearProjectStore } from "./store";
import { useSelector } from "@xstate/react";
import { getGearPosition } from "./GearParser";
import { gsap } from "gsap";

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
  const activeGear = useGear(activeGearId);
  const gearProjectModule = useGearProjectStore(state => state.gearProject.module);
  const gears = useGearProjectStore(state => state.gearProject.gears);

  useEffect(() => {
    const tickerCallback = () => {
      if (!gRef.current) return;
      const position = getGearPosition(activeGear, gears, gsap.ticker.time, gearProjectModule);
      gRef.current.setAttribute('transform', `translate(${position[0]}, ${position[1]})`);
    }
    gsap.ticker.add(tickerCallback);
    return () => gsap.ticker.remove(tickerCallback);
  }, [activeGear, gears, gearProjectModule]);
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

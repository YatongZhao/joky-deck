import { useEffect, useRef } from "react";
import { rotatePoint } from "./core/gear";
import { useSelector } from "@xstate/react";
import { getGearPosition } from "./GearParser";
import { useAppSelector } from "./store/redux";
import { editorMachineSelector } from "./store/redux/slices/editorMachineSlice";
import { selectAllGears, selectGearById } from "./store/redux/slices/gearsSlice";
import { addTicker } from "./store/dynamicGearPosition";

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
  const activeGear = useAppSelector((state) => selectGearById(state, activeGearId ?? ''));
  const gearProjectModule = useAppSelector((state) => state.module.value);
  const gears = useAppSelector(selectAllGears);

  useEffect(() => {
    const tickerCallback = (time: number) => {
      if (!gRef.current) return;
      const position = getGearPosition(activeGear, gears, time, gearProjectModule);
      gRef.current.setAttribute('transform', `translate(${position[0]}, ${position[1]})`);
    }
    const removeTicker = addTicker(tickerCallback);
    return () => removeTicker();
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

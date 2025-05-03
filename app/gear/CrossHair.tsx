import { useEffect, useRef } from "react";
import { rotatePoint } from "./core/gear";
import { svgMatrix$, useActiveGearPosition } from "./store";
import { mat3, vec2 } from "gl-matrix";

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
  const activeGearPosition = useActiveGearPosition();
  const gRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const subscription = svgMatrix$.subscribe((matrix) => {
      if (gRef.current) {
        const matrixInverse = mat3.create();
        mat3.invert(matrixInverse, matrix);
        const position = vec2.create();
        vec2.transformMat3(position, vec2.fromValues(activeGearPosition[0], activeGearPosition[1]), matrixInverse);
        gRef.current.setAttribute('transform', `translate(${position[0]}, ${position[1]})`);
      }
    });
    return () => subscription.unsubscribe();
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

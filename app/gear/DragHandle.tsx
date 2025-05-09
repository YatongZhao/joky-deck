import { useDrag } from "./hooks/useDrag";
import { useEffect } from "react";
import { mat3, vec2 } from "gl-matrix";
import { finalMatrix$, svgMatrix$ } from "./store";
import { BehaviorSubject } from "rxjs";
import { getScale } from "./core/coordinate";

const BASE_RADIUS = 8;
const getRectPath = (radius: number) => `M ${radius} ${radius} L ${radius} -${radius} L -${radius} -${radius} L -${radius} ${radius} Z`;
const getCirclePath = (radius: number) => `M ${0}, ${radius} A ${radius} ${radius} 0 0 1 ${0} ${-radius} A ${radius} ${radius} 0 0 1 ${0} ${radius} Z`;

export const DragHandle: React.FC<{
  svgPosition$: BehaviorSubject<vec2>;
  onDragEnd?: () => void;
  onDragStart?: () => void;
  shape?: "circle" | "rect";
}> = ({ svgPosition$, onDragEnd, onDragStart, shape = "rect" }) => {
  const { deltaMatrix$, ref } = useDrag<SVGPathElement>({ onDragEnd, onDragStart });

  useEffect(() => {
    const subscription = svgMatrix$.subscribe((matrix) => {
      const scale = getScale(matrix);
      const radius = BASE_RADIUS / scale[0];
      if (!ref.current) return;
      const target = ref.current;
      target.setAttribute('d', shape === "circle" ? getCirclePath(radius) : getRectPath(radius));
      target.setAttribute('stroke-width', `${2 / scale[0]}`);
    });
    return () => subscription.unsubscribe();
  }, [shape, ref]);

  useEffect(() => {
    const subscription = svgPosition$.subscribe((position) => {
      if (!ref.current) return;
      const target = ref.current;
      target.setAttribute('transform', `translate(${position[0]}, ${position[1]})`);
    });
    return () => subscription.unsubscribe();
  }, [svgPosition$, ref]);
  
  useEffect(() => {
    const deltaSubscription = deltaMatrix$.subscribe((deltaMatrix) => {
      const screenPosition = vec2.create();
      vec2.transformMat3(screenPosition, svgPosition$.getValue(), finalMatrix$.getValue());
      vec2.transformMat3(screenPosition, screenPosition, deltaMatrix);
      vec2.transformMat3(svgPosition$.getValue(), screenPosition, mat3.invert(mat3.create(), finalMatrix$.getValue()));
      svgPosition$.next(svgPosition$.getValue());
    });

    return () => {
      deltaSubscription.unsubscribe();
    };
  }, [deltaMatrix$, svgPosition$]);

  return <path ref={ref} d={shape === "circle" ? getCirclePath(BASE_RADIUS) : getRectPath(BASE_RADIUS)} fill="white" stroke="black" strokeWidth="1" style={{ cursor: "move" }} />
}

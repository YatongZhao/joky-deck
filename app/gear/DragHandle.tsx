import { useDrag } from "./hooks/useDrag";
import { useEffect } from "react";
import { mat3, vec2 } from "gl-matrix";
import { finalMatrix$ } from "./store";
import { BehaviorSubject } from "rxjs";

export const DragHandle: React.FC<{
  svgPosition$: BehaviorSubject<vec2>;
  onDragEnd?: () => void;
  onDragStart?: () => void;
}> = ({ svgPosition$, onDragEnd, onDragStart }) => {
  const { deltaMatrix$, ref } = useDrag<SVGPathElement>({ onDragEnd, onDragStart });

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

  return <path ref={ref} d={"M 5 5 L 5 -5 L -5 -5 L -5 5 Z"} fill="white" stroke="black" strokeWidth="1" style={{ cursor: "move" }} />
}

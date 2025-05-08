import { useDrag } from "./hooks/useDrag";
import { useEffect } from "react";
import { mat3, vec2 } from "gl-matrix";
import { finalMatrix$ } from "./store";
import { BehaviorSubject } from "rxjs";

export const DragHandle: React.FC<{ position$: BehaviorSubject<vec2>; onDragEnd?: () => void }> = ({ position$, onDragEnd }) => {
  const { deltaMatrix$, ref } = useDrag<SVGPathElement>({ onDragEnd });

  useEffect(() => {
    const subscription = position$.subscribe((position) => {
      if (!ref.current) return;
      const target = ref.current;
      target.setAttribute('transform', `translate(${position[0]}, ${position[1]})`);
    });
    return () => subscription.unsubscribe();
  }, [position$, ref]);
  
  useEffect(() => {
    const deltaSubscription = deltaMatrix$.subscribe((deltaMatrix) => {
      const screenPosition = vec2.create();
      vec2.transformMat3(screenPosition, position$.getValue(), finalMatrix$.getValue());
      vec2.transformMat3(screenPosition, screenPosition, deltaMatrix);
      vec2.transformMat3(position$.getValue(), screenPosition, mat3.invert(mat3.create(), finalMatrix$.getValue()));
      position$.next(position$.getValue());
    });

    return () => {
      deltaSubscription.unsubscribe();
    };
  }, [deltaMatrix$, position$]);

  return <path ref={ref} d={"M 5 5 L 5 -5 L -5 -5 L -5 5 Z"} fill="white" stroke="black" strokeWidth="1" style={{ cursor: "move" }} />
}

import { useDrag } from "./hooks/useDrag";
import { useCallback, useEffect, useState } from "react";
import { mat3, vec2 } from "gl-matrix";
import { finalMatrix$, displayMatrix$ } from "./store";
import { BehaviorSubject, skip } from "rxjs";
import { getScale } from "./core/coordinate";

const BASE_RADIUS = 6;
const getRectPath = (radius: number) => `M ${radius} ${radius} L ${radius} -${radius} L -${radius} -${radius} L -${radius} ${radius} Z`;
const getCirclePath = (radius: number) => `M ${0}, ${radius} A ${radius} ${radius} 0 0 1 ${0} ${-radius} A ${radius} ${radius} 0 0 1 ${0} ${radius} Z`;

export const DragHandle: React.FC<{
  handleSvgPosition$: Omit<BehaviorSubject<vec2>, 'next'>;
  onPositionChange: (position: vec2) => void;
  onDragEnd?: () => void;
  onDragStart?: () => void;
  shape?: "circle" | "rect";
}> = ({ handleSvgPosition$, onPositionChange, onDragEnd, onDragStart, shape = "rect" }) => {
  const [targetSvgPosition$] = useState(new BehaviorSubject<vec2>(vec2.clone(handleSvgPosition$.getValue())));
  const handleDragStart = useCallback(() => {
    console.log('handleDragStart');
    targetSvgPosition$.next(vec2.clone(handleSvgPosition$.getValue()));
    onDragStart?.();
  }, [onDragStart, handleSvgPosition$, targetSvgPosition$]);
  const { deltaMatrix$, ref } = useDrag<SVGPathElement>({ onDragEnd, onDragStart: handleDragStart });
  
  useEffect(() => {
    const subscription = targetSvgPosition$.pipe(skip(1)).subscribe(onPositionChange);
    return () => subscription.unsubscribe();
  }, [targetSvgPosition$, onPositionChange]);

  useEffect(() => {
    const subscription = displayMatrix$.subscribe((matrix) => {
      const scale = getScale(matrix);
      const radius = BASE_RADIUS / scale[0];
      if (!ref.current) return;
      const target = ref.current;
      target.setAttribute('d', shape === "circle" ? getCirclePath(radius) : getRectPath(radius));
      target.setAttribute('stroke-width', `${1 / scale[0]}`);
    });
    return () => subscription.unsubscribe();
  }, [shape, ref]);

  useEffect(() => {
    const subscription = handleSvgPosition$.subscribe((position) => {
      if (!ref.current) return;
      const target = ref.current;
      target.setAttribute('transform', `translate(${position[0]}, ${position[1]})`);
    });
    return () => subscription.unsubscribe();
  }, [handleSvgPosition$, ref]);
  
  useEffect(() => {
    const deltaSubscription = deltaMatrix$.pipe(skip(1)).subscribe((deltaMatrix) => {
      const screenPosition = vec2.create();
      vec2.transformMat3(screenPosition, targetSvgPosition$.getValue(), finalMatrix$.getValue());
      vec2.transformMat3(screenPosition, screenPosition, deltaMatrix);
      vec2.transformMat3(targetSvgPosition$.getValue(), screenPosition, mat3.invert(mat3.create(), finalMatrix$.getValue()));
      targetSvgPosition$.next(targetSvgPosition$.getValue());
    });

    return () => {
      deltaSubscription.unsubscribe();
    };
  }, [deltaMatrix$, targetSvgPosition$]);

  return <path ref={ref} d={shape === "circle" ? getCirclePath(BASE_RADIUS) : getRectPath(BASE_RADIUS)} fill="white" stroke="black" strokeWidth="1" style={{ cursor: "move" }} />
}

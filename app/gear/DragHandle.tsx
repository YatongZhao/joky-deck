import { useDrag } from "./hooks/useDrag";
import { useEffect, useRef } from "react";
import { mat3, vec2 } from "gl-matrix";
import { finalMatrix$ } from "./store";

export const DragHandle = () => {
  const { translateMatrix$, ref } = useDrag<SVGPathElement>();
  const svgPositionRef = useRef<vec2>(vec2.create());
  useEffect(() => {
    if (!ref.current) return;
    const target = ref.current;
    const translateSubscription = translateMatrix$.subscribe((translateMatrix) => {
      const finalMatrix = finalMatrix$.getValue();
      const vector = vec2.create();
      const matrix = mat3.create();
      mat3.invert(matrix, finalMatrix);
      mat3.multiply(matrix, matrix, translateMatrix);
      vec2.transformMat3(svgPositionRef.current, vector, matrix);
      target.setAttribute('transform', `translate(${svgPositionRef.current[0]}, ${svgPositionRef.current[1]})`);
    });
    const finalMatrixSubscription = finalMatrix$.subscribe((finalMatrix) => {
      const screenPosition = vec2.create();
      const translateMatrix = translateMatrix$.getValue();
      const invertTranslateMatrix = mat3.create();
      mat3.invert(invertTranslateMatrix, translateMatrix);
      const matrix = mat3.create();
      mat3.multiply(matrix, invertTranslateMatrix, finalMatrix);
      vec2.transformMat3(screenPosition, svgPositionRef.current, matrix);
      mat3.translate(translateMatrix, translateMatrix, screenPosition);
    });

    return () => {
      translateSubscription.unsubscribe();
      finalMatrixSubscription.unsubscribe();
    };
  }, [ref, translateMatrix$]);

  return <path ref={ref} d={"M 10 10 L 10 20 L 20 20 L 20 10 Z"} fill="black" />
}

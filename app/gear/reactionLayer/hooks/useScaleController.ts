import { useCallback, useEffect, useState } from "react";
import { displayMatrix$, translateMatrix$ } from "../../store";
import { getScale, scaleAtPoint } from "../../core/coordinate";
import { mat3, vec2 } from "gl-matrix";

export const MAX_SCALE = 30;
export const MIN_SCALE = 0.1;

export const scaleSvgAtGlobalPoint = (point: vec2, scale: number) => {
  const displayMatrix = displayMatrix$.getValue();
  const translateMatrix = translateMatrix$.getValue();
  const oldScale = getScale(displayMatrix)[0];
  const scaleMatrix = mat3.create();

  const svgPoint = vec2.transformMat3(vec2.create(), point, mat3.invert(mat3.create(), translateMatrix));
  
  scaleAtPoint(scaleMatrix, svgPoint, scale / oldScale);
  mat3.multiply(displayMatrix, scaleMatrix, displayMatrix);
  displayMatrix$.next(displayMatrix);
}

export const useScaleController = () => {
  const [scale, setScale] = useState(getScale(displayMatrix$.getValue())[0]);
  useEffect(() => {
    displayMatrix$.subscribe((matrix) => {
      const scale = getScale(matrix)[0];
      setScale(scale);
    })
  }, []);

  const increaseScaleBy10 = useCallback(() => {
    scaleSvgAtGlobalPoint(vec2.fromValues(window.innerWidth / 2, window.innerHeight / 2), Math.min(MAX_SCALE, scale + .1));
  }, [scale]);

  const decreaseScaleBy10 = useCallback(() => {
    scaleSvgAtGlobalPoint(vec2.fromValues(window.innerWidth / 2, window.innerHeight / 2), Math.max(MIN_SCALE, scale - .1));
  }, [scale]);

  const resetScale = useCallback(() => {
    scaleSvgAtGlobalPoint(vec2.fromValues(window.innerWidth / 2, window.innerHeight / 2), 1);
  }, []);

  return { scale, increaseScaleBy10, decreaseScaleBy10, resetScale };
};

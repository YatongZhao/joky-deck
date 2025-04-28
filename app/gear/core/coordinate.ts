import { vec2, mat3 } from 'gl-matrix';

export const scaleAtPoint = (matrix: mat3, point: vec2, scale: number) => {
  mat3.translate(matrix, matrix, point);
  mat3.scale(matrix, matrix, [scale, scale]);
  mat3.translate(matrix, matrix, [-point[0], -point[1]]);
}

export const getScale = (matrix: mat3) => {
  return vec2.fromValues(
    Math.hypot(matrix[0], matrix[1]),
    Math.hypot(matrix[3], matrix[4]),
  );
}

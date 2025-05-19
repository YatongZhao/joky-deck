import { mat3, vec2 } from "gl-matrix";
import { Matrix, Position } from "../core/types";

export const toPercent = (value: number) => {
  return `${(value * 100).toFixed(0)}%`;
};

export const vec2ToPosition = (vec2: vec2) => {
  return [vec2[0], vec2[1]] as Position;
};

export const positionToVec2 = (position: Position) => {
  return vec2.fromValues(position[0], position[1]);
};

export const mat3ToMatrix = (mat3: mat3) => {
  return [
    mat3[0], mat3[1], mat3[2],
    mat3[3], mat3[4], mat3[5],
    mat3[6], mat3[7], mat3[8],
  ] as Matrix;
};

export const matrixToMat3 = (matrix: Matrix) => {
  return mat3.fromValues(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5], matrix[6], matrix[7], matrix[8]);
};

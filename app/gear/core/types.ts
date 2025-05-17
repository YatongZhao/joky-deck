import { vec2, mat3 } from "gl-matrix";
import { editorMachine } from "../editorMachine";
import { Snapshot } from "xstate";

export enum GearType {
  Relative = 'relative',
  Absolute = 'absolute',
}

export type GearData = {
  id: string;
  type: GearType;
  parentId?: string | null;
  teeth: number;
  positionAngle: number;
  position?: vec2;
  color?: string;
}

export type GearProjectData = {
  version: string;
  displayMatrix: mat3;
  // deprecated
  rootGearId: string;
  // deprecated
  rootGearPosition: vec2;
  gears: GearData[];
  module: number;
  durationUnit: number;
  viewBox: {
    a: vec2;
    b: vec2;
  };
  editorMachineState: Snapshot<typeof editorMachine> | null;
}

export const initialGearProject: GearProjectData = {
  version: '1.0.0',
  displayMatrix: mat3.create(),
  rootGearId: '1',
  rootGearPosition: vec2.create(),
  module: 5,
  durationUnit: 1,
  viewBox: {
    a: vec2.fromValues(-480, -270),
    b: vec2.fromValues(480, 270),
  },
  gears: [
    {
      id: '1',
      type: GearType.Absolute,
      teeth: 91,
      parentId: null,
      positionAngle: 0,
      position: vec2.create(),
    },
  ],
  editorMachineState: null,
}

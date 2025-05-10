import { vec2, mat3 } from "gl-matrix";
import { editorMachine } from "../editorMachine";
import { Snapshot } from "xstate";

export type GearData = {
  id: string;
  parentId: string | null;
  teeth: number;
  positionAngle: number;
  color?: string;
}

export type GearProjectData = {
  version: string;
  displayMatrix: mat3;
  rootGearId: string;
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
      parentId: null,
      teeth: 91,
      positionAngle: 0,
    },
  ],
  editorMachineState: null,
}

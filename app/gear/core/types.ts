import { editorMachine } from "../editorMachine";
import { Snapshot } from "xstate";

export enum GearType {
  Relative = 'relative',
  Absolute = 'absolute',
}

export type Position = [number, number];
export type Matrix = [
  number, number, number,
  number, number, number,
  number, number, number,
];

export type GearData = {
  id: string;
  type: GearType;
  parentId?: string | null;
  teeth: number;
  positionAngle: number;
  position: Position;
  speed: number; // degree per millisecond
  color?: string;
}

export type GearProjectData = {
  version: string;
  displayMatrix: Matrix;
  gears: GearData[];
  module: number;
  viewBox: {
    // a: Position;
    // b: Position;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
  editorMachineState: Snapshot<typeof editorMachine> | null;
}

export const initialGearProject: GearProjectData = {
  version: '1.0.0',
  displayMatrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  module: 5,
  viewBox: {
    x1: -480,
    y1: -270,
    x2: 480,
    y2: 270,
  },
  gears: [
    {
      id: '1',
      type: GearType.Absolute,
      teeth: 91,
      parentId: null,
      positionAngle: 0,
      position: [0, 0],
      speed: 6, // degree per millisecond
    },
  ],
  editorMachineState: null,
}

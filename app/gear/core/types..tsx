export type GearData = {
  id: string;
  parentId: string | null;
  teeth: number;
  positionAngle: number;
  color?: string;
}

export type GearProjectData = {
  version: string;
  displayMatrix: [number, number, number, number, number, number, number, number, number];
  rootGearId: string;
  gears: GearData[];
  module: number;
  durationUnit: number;
  viewBox: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

export const mockGearProject: GearProjectData = {
  version: '1.0.0',
  displayMatrix: [1, 0, 0, 0, 1, 0, 0, 0, 1],
  rootGearId: '1',
  module: 5,
  durationUnit: 1,
  viewBox: {
    left: -320,
    top: -180,
    width: 640,
    height: 360,
  },
  gears: [
    {
      id: '1',
      parentId: null,
      teeth: 6,
      positionAngle: 0,
      color: 'red',
    },
    {
      id: '2',
      parentId: '1',
      teeth: 6,
      positionAngle: 10,
    },
    {
      id: '3',
      parentId: '2',
      teeth: 3,
      positionAngle: 80,
    },
    {
      id: '4',
      parentId: '3',
      teeth: 4,
      positionAngle: 30,
    },
    {
      id: '5',
      parentId: '4',
      teeth: 5,
      positionAngle: 0,
    },
    {
      id: '6',
      parentId: '5',
      teeth: 12,
      positionAngle: 0,
    },
    {
      id: '7',
      parentId: '6',
      teeth: 34,
      positionAngle: 30,
    },
  ],
}

export const addGearToMockGearProject = (gear: GearData) => {
  mockGearProject.gears = [...mockGearProject.gears, gear];
}

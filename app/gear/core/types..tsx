export type GearData = {
  id: string;
  parentId: string | null;
  teeth: number;
  positionAngle: number;
}

export const testGears: GearData[] = [
  {
    id: '1',
    parentId: null,
    teeth: 6,
    positionAngle: 0,
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
];

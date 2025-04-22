type GearInfo = {
  teeth: number;
  module: number;
  pitchCircleDiameter: number;
  addendum: number;
  dedendum: number;
}

export function calculateGearInfo(teeth: number, module: number): GearInfo {
  const pitchCircleDiameter = teeth * module;
  const addendum = module;
  const dedendum = 1.25 * module;

  return {
    teeth,
    module,
    pitchCircleDiameter,
    addendum,
    dedendum
  };
}

// GearGenerator.ts
const DEG2RAD = Math.PI / 180;

interface GearParams {
  teeth: number;
  module: number;
  pressureAngleDeg?: number; // 默认20°
  resolution?: number; // 渐开线采样点数量
}

export function generateGearPath({
  teeth,
  module,
  pressureAngleDeg = 20,
  resolution = 15,
}: GearParams): string {
  const alpha = pressureAngleDeg * DEG2RAD;
  const pitchRadius = (teeth * module) / 2;
  const baseRadius = pitchRadius * Math.cos(alpha);
  const addendum = module;
  const dedendum = 1.25 * module;
  const outerRadius = pitchRadius + addendum;
  const rootRadius = pitchRadius - dedendum;
  const teethAngle = Math.PI / teeth;

  const toothPath = involuteToothPath(
    baseRadius,
    outerRadius,
    rootRadius,
    pitchRadius,
    resolution,
    teethAngle,
  );

  const deltaAngle = (Math.atan2(toothPath.leftPoints[0][1], toothPath.leftPoints[0][0])- Math.atan2(toothPath.rightPoints[toothPath.rightPoints.length - 1][1], toothPath.rightPoints[toothPath.rightPoints.length - 1][0])) / 2;

  let path = ``;
  let startPoint: [number, number] = [0, 0];
  for (let i = teeth - 1; i >= 0; i--) {
    const angle = (2 * Math.PI * i) / teeth + deltaAngle - Math.PI / 2;

    let startRootPoint: [number, number] = [0, 0];
    let endRootPoint: [number, number] = [0, 0];
      
    if (rootRadius < baseRadius) {
      startRootPoint = rotatePoint((toothPath.leftPoints[0]).map(v => v / baseRadius * rootRadius) as [number, number], angle);
      endRootPoint = rotatePoint((toothPath.rightPoints[toothPath.rightPoints.length - 1]).map(v => v / baseRadius * rootRadius) as [number, number], angle);
    } else {
      startRootPoint = rotatePoint(toothPath.leftPoints[0], angle);
      endRootPoint = rotatePoint(toothPath.rightPoints[toothPath.rightPoints.length - 1], angle);
    }

    if (i !== teeth - 1) {
      path += ` A ${rootRadius} ${rootRadius} 0 0 0 ${startRootPoint.map((value) => `${value.toFixed(2)}`).join(" ")}`;
    } else {
      startPoint = startRootPoint;
    }

    path += `${i === teeth - 1 ? "M" : "L"} ${startRootPoint.map((value) => `${value.toFixed(2)}`).join(",")}`;
    path += ` L ${toothPath.leftPoints.map(([x, y]) => rotatePoint([x, y], angle)).map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" L ")}`;
    path += ` A ${outerRadius} ${outerRadius} 0 0 0 ${rotatePoint(toothPath.rightPoints[0], angle).map((value) => `${value.toFixed(2)}`).join(" ")}`;
    path += ` L ${toothPath.rightPoints.map(([x, y]) => rotatePoint([x, y], angle)).map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" L ")}`;
    path += `L ${endRootPoint.map((value) => `${value.toFixed(2)}`).join(",")}`;
  }

  path += ` A ${rootRadius} ${rootRadius} 0 0 0 ${startPoint.map((value) => `${value.toFixed(2)}`).join(" ")} Z`;

  return path;
}

// 生成一个齿的渐开线 + 镜像（近似双边齿形）
function involuteToothPath(
  baseRadius: number,
  outerRadius: number,
  rootRadius: number,
  pitchRadius: number,
  steps: number,
  teethAngle: number,
): { leftPoints: [number, number][], rightPoints: [number, number][] } {
  console.log(baseRadius, outerRadius, rootRadius, pitchRadius);
  const start = Math.max(rootRadius, baseRadius);
  const to1 = Math.sqrt((start ** 2) - (baseRadius ** 2)) / baseRadius;
  const to2 = Math.sqrt((outerRadius ** 2) - (baseRadius ** 2)) / baseRadius;
  const delta = to2 - to1;

  const leftPoints: [number, number][] = [];
  const rightPoints: [number, number][] = [];
  // 渐开线正向
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * delta + to1;
    const r = Math.sqrt((t * baseRadius) ** 2 + (baseRadius ** 2));
    const theta = t - Math.atan(t);

    const x = r * Math.sin(theta);
    const y = r * Math.cos(theta);
    leftPoints.push([x, y]);
  }

  // 渐开线反向
  for (let i = steps; i >= 0; i--) {
    const t = (i / steps) * delta + to1;
    const r = Math.sqrt((t * baseRadius) ** 2 + (baseRadius ** 2));
    const theta = t - Math.atan(t);

    const x = r * Math.sin(theta);
    const y = r * Math.cos(theta);
    rightPoints.push(rotatePoint([-x, y], -teethAngle));
  }

  return {
    leftPoints,
    rightPoints,
  };
}

function rotatePoint(point: [number, number], angleRad: number): [number, number] {
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);
  return [point[0] * cosA - point[1] * sinA, point[0] * sinA + point[1] * cosA];
}

export const GEARS_10 = {
  [6]: calculateGearInfo(6, 10),
  [12]: calculateGearInfo(12, 10),
  [18]: calculateGearInfo(18, 10),
  [24]: calculateGearInfo(24, 10),
}

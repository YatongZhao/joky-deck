import { create } from "zustand";
import { combine } from "zustand/middleware";
import { GearData, GearProjectData, mockGearProject } from "../core/types.";
import { useMemo } from "react";
import { BehaviorSubject, combineLatest, fromEvent, merge, of } from "rxjs";
import { mat3, vec2 } from "gl-matrix";
import { getGearTransformVector } from "../core/gear";

export const svgMatrix$ = new BehaviorSubject<mat3>(mat3.fromValues(...mockGearProject.displayMatrix));

export const translateMatrix$ = new BehaviorSubject<mat3>(mat3.create());
merge(of(null), fromEvent(window, 'resize')).subscribe(() => {
  const windowInnerWidth = window.innerWidth;
  const windowInnerHeight = window.innerHeight;
  const translateVector = vec2.fromValues(windowInnerWidth / 2, windowInnerHeight / 2);
  const translateMatrix = mat3.create();
  mat3.translate(translateMatrix, translateMatrix, translateVector);
  translateMatrix$.next(translateMatrix);
});

export const finalMatrix$ = new BehaviorSubject<mat3>(mat3.create());
combineLatest([svgMatrix$, translateMatrix$]).subscribe(([svgMatrix, translateMatrix]) => {
  const finalMatrix = mat3.create();
  mat3.multiply(finalMatrix, translateMatrix, svgMatrix);
  finalMatrix$.next(finalMatrix);
});


export const useGearProjectStore = create(
  combine<{
  gearProject: GearProjectData;
}, {
  addGear: (gear: GearData) => void;
  setGearProject: (gearProject: GearProjectData) => void;
  setGearPositionAngle: (gearId: string, positionAngle: number) => void;
  setGearColor: (gearId: string, color: string) => void;
}>(
    {
      gearProject: mockGearProject,
    }, (set) => ({
    setGearProject: (gearProject: GearProjectData) => {
      set({ gearProject });
    },
    addGear: (gearData: GearData) => {
      set((state) => ({
        gearProject: {
          ...state.gearProject,
          gears: [...state.gearProject.gears, gearData],
        },
      }));
    },
    setGearPositionAngle: (gearId: string, positionAngle: number) => {
      set((state) => ({
        gearProject: {
          ...state.gearProject,
          gears: state.gearProject.gears.map((gear) => gear.id === gearId ? { ...gear, positionAngle } : gear),
        },
      }));
    },
    setGearColor: (gearId: string, color: string) => {
      set((state) => ({
        gearProject: {
          ...state.gearProject,
          gears: state.gearProject.gears.map((gear) => gear.id === gearId ? { ...gear, color } : gear),
        },
      }));
    },
  }))
);

const getGear = (gears: GearData[], gearId: string | null) => gears.find((gear) => gear.id === gearId);

export const useGear = (gearId: string | null) => {
  const gears = useGearProjectStore((state) => state.gearProject.gears);
  return useMemo(() => getGear(gears, gearId), [gears, gearId]);
}

export const useGearChildren = (gearId: string) => {
  const gearProject = useGearProjectStore((state) => state.gearProject);
  return useMemo(() => gearProject.gears.filter((gear) => gear.parentId === gearId), [gearProject.gears, gearId]);
}

export const useGearPosition = (gearId: string | null) => {
  const gears = useGearProjectStore((state) => state.gearProject.gears);
  const gearModule = useGearProjectStore((state) => state.gearProject.module);
  const targetGear = useGear(gearId);

  const gearPosition = useMemo(() => {
    let currentGear = targetGear;
    const globalTransformMatrix = mat3.create();
  
    if (!currentGear) return vec2.create();
  
    let parentGear;
    while (currentGear.parentId !== null) {
      parentGear = getGear(gears, currentGear.parentId)!;
      mat3.translate(globalTransformMatrix, globalTransformMatrix, getGearTransformVector(currentGear.positionAngle, currentGear.teeth, parentGear.teeth, gearModule))
      currentGear = parentGear;
    }
  
    return vec2.transformMat3(vec2.create(), vec2.create(), globalTransformMatrix);
  }, [gears, gearModule, targetGear])

  return gearPosition;
}
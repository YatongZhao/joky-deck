import { create } from "zustand";
import { combine } from "zustand/middleware";
import { GearData, GearProjectData, mockGearProject } from "../core/types.";
import { useMemo, useEffect } from "react";
import { BehaviorSubject, combineLatest, fromEvent, merge, of } from "rxjs";
import { mat3, vec2 } from "gl-matrix";
import { EditorMachineContext } from "../editorMachine";

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
  activeGearPosition: [number, number];
  gearProject: GearProjectData;
}, {
  addGear: (gear: GearData) => void;
  setGearProject: (gearProject: GearProjectData) => void;
  setGearPositionAngle: (gearId: string, positionAngle: number) => void;
  setGearColor: (gearId: string, color: string) => void;
  setActiveGearPosition: (position: [number, number]) => void;
}>(
    {
      gearProject: mockGearProject,
      activeGearPosition: [0, 0],
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
    setActiveGearPosition: (position: [number, number]) => {
      set({ activeGearPosition: position });
    },
  }))
);

export const useGear = (gearId: string | null) => {
  const gearProject = useGearProjectStore((state) => state.gearProject);
  return useMemo(() => gearProject.gears.find((gear) => gear.id === gearId), [gearProject.gears, gearId]);
}

export const useGearChildren = (gearId: string) => {
  const gearProject = useGearProjectStore((state) => state.gearProject);
  return useMemo(() => gearProject.gears.filter((gear) => gear.parentId === gearId), [gearProject.gears, gearId]);
}

export const useActiveGearPosition = () => {
  const setActiveGearPosition = useGearProjectStore((state) => state.setActiveGearPosition);
  const gearProject = useGearProjectStore((state) => state.gearProject);
  const activeGearId = EditorMachineContext.useSelector((state) => state.context.selectedGearId);
  const activeGear = useGear(activeGearId);
  const activeGearPosition = useGearProjectStore((state) => state.activeGearPosition);

  useEffect(() => {
    const subscription = svgMatrix$.subscribe(() => {
      if (!activeGear) return;

      const activeGearElement = document.getElementById(activeGear.id);
      if (!activeGearElement) return;

      const { x, y, width, height } = activeGearElement.getBoundingClientRect();

      setActiveGearPosition([x + width / 2, y + height / 2]);
    });

    return () => subscription.unsubscribe();
  }, [gearProject.gears, activeGear, setActiveGearPosition]);

  return activeGearPosition;
}

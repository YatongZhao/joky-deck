import { create } from "zustand";
import { combine } from "zustand/middleware";
import { GearData, GearProjectData, mockGearProject } from "../core/types.";
import { useMemo, useEffect } from "react";
import { BehaviorSubject } from "rxjs";
import { mat3 } from "gl-matrix";
import { EditorMachineContext } from "../editorMachine";

export const useGearProjectStore = create(
  combine<{
  activeGearPosition: [number, number];
  gearProject: GearProjectData;
  svgMatrix$: BehaviorSubject<mat3>;
}, {
  addGear: (gear: GearData) => void;
  setGearProject: (gearProject: GearProjectData) => void;
  setGearPositionAngle: (gearId: string, positionAngle: number) => void;
  setGearColor: (gearId: string, color: string) => void;
  setActiveGearPosition: (position: [number, number]) => void;
  setSvgMatrix: (matrix: mat3) => void;
}>(
    {
      gearProject: mockGearProject,
      activeGearPosition: [0, 0],
      svgMatrix$: new BehaviorSubject(mat3.fromValues(...mockGearProject.displayMatrix)),
    }, (set, getState) => ({
    setGearProject: (gearProject: GearProjectData) => {
      set({ gearProject });
      set({ svgMatrix$: new BehaviorSubject(mat3.fromValues(...gearProject.displayMatrix)) });
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
    setSvgMatrix: (matrix: mat3) => {
      const svgMatrix$ = getState().svgMatrix$;
      svgMatrix$.next(matrix);
      // TODO: 
      // set((state) => ({
      //   gearProject: {
      //     ...state.gearProject,
      //     displayMatrix: Array.from(matrix) as [number, number, number, number, number, number, number, number, number],
      //   },
      // }));
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
  const svgMatrix$ = useGearProjectStore((state) => state.svgMatrix$);
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
  }, [gearProject.gears, activeGear, setActiveGearPosition, svgMatrix$]);

  return activeGearPosition;
}

import { create } from "zustand";
import { combine } from "zustand/middleware";
import { GearData, GearProjectData, mockGearProject } from "../core/types.";
import { SetStateAction, useMemo, Dispatch, useEffect } from "react";
import { BehaviorSubject } from "rxjs";
import { mat3 } from "gl-matrix";

export const useGearProjectStore = create(
  combine<{
  activeGearId: string | null;
  activeGearPosition: [number, number];
  gearProject: GearProjectData;
  svgMatrix$: BehaviorSubject<mat3>;

  // Mode related
  addModeEnabled: boolean;
}, {
  addGear: (gear: GearData) => void;
  setActiveGearId: Dispatch<SetStateAction<string | null>>;
  setGearProject: (gearProject: GearProjectData) => void;
  setGearPositionAngle: (gearId: string, positionAngle: number) => void;
  setGearColor: (gearId: string, color: string) => void;
  setActiveGearPosition: (position: [number, number]) => void;

  // Mode related
  setAddModeEnabled: (addModeEnabled: boolean) => void;
}>(
    {
      gearProject: mockGearProject,
      activeGearId: null,
      activeGearPosition: [0, 0],
      svgMatrix$: new BehaviorSubject(mat3.create()),
      addModeEnabled: false,
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
    setActiveGearId: (activeGearId) => {
      set((state) => ({ activeGearId: typeof activeGearId === 'function' ? activeGearId(state.activeGearId) : activeGearId }));
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
    // Mode related
    setAddModeEnabled: (addModeEnabled: boolean) => {
      set({ addModeEnabled });
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
  const activeGearId = useGearProjectStore((state) => state.activeGearId);
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

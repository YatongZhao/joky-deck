import { create } from "zustand";
import { combine } from "zustand/middleware";
import { GearData, GearProjectData, mockGearProject } from "../core/types.";
import { SetStateAction } from "react";
import { Dispatch } from "react";

export const useGearProjectStore = create(
  combine<{
  activeGearId: string | null;
  gearProject: GearProjectData;
  scale: number;
}, {
  addGear: (gear: GearData) => void;
  setActiveGearId: Dispatch<SetStateAction<string | null>>;
  setGearProject: (gearProject: GearProjectData) => void;
}>(
    {
      gearProject: mockGearProject,
      activeGearId: null,
      scale: 1,
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
  }))
);


import { GearProjectData, initialGearProject } from "@/app/gear/core/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const initializeModuleState = (gearProject: GearProjectData) => {
  return { value: gearProject.module };
}

const moduleSlice = createSlice({
  name: 'module',
  initialState: initializeModuleState(initialGearProject),
  reducers: {
    resetModule: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
    },
    setModule: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
    },
  },
});

export const { resetModule, setModule } = moduleSlice.actions;

export default moduleSlice.reducer;

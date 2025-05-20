import { GearProjectData, initialGearProject, Matrix } from "@/app/gear/core/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type DisplayMatrixState = {
  value: Matrix;
}

export const initializeDisplayMatrixState = (gearProject: GearProjectData): DisplayMatrixState => {
  return { value: gearProject.displayMatrix };
}

export const displayMatrixSlice = createSlice({
  name: 'displayMatrix',
  initialState: initializeDisplayMatrixState(initialGearProject),
  reducers: {
    setDisplayMatrix: (state, action: PayloadAction<Matrix>) => {
      state.value = action.payload;
    },
  },
});

export const { setDisplayMatrix } = displayMatrixSlice.actions;
export default displayMatrixSlice.reducer;

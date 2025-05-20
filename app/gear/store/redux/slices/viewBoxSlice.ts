import { GearProjectData, initialGearProject, Position } from "@/app/gear/core/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ViewBoxState = {
  a: Position;
  b: Position;
}

export const initializeViewBoxState = (gearProject: GearProjectData): ViewBoxState => {
  return gearProject.viewBox;
}

const viewBoxSlice = createSlice({
  name: 'viewBox',
  initialState: initializeViewBoxState(initialGearProject),
  reducers: {
    setViewBoxAPoint: (state, action: PayloadAction<Position>) => {
      state.a = action.payload;
    },
    setViewBoxBPoint: (state, action: PayloadAction<Position>) => {
      state.b = action.payload;
    },
  },
});

export const { setViewBoxAPoint, setViewBoxBPoint } = viewBoxSlice.actions;
export default viewBoxSlice.reducer;

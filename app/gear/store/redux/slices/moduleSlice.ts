import { initialGearProject } from "@/app/gear/core/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const moduleSlice = createSlice({
  name: 'module',
  initialState: { value: initialGearProject.module },
  reducers: {
    setModule: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
    },
  },
});

export const { setModule } = moduleSlice.actions;

export default moduleSlice.reducer;

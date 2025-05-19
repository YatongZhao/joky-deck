import { initialGearProject, Matrix } from "@/app/gear/core/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type DisplayMatrixState = {
  value: Matrix;
}

const initialState: DisplayMatrixState = {
  value: initialGearProject.displayMatrix,
};

export const displayMatrixSlice = createSlice({
  name: 'displayMatrix',
  initialState,
  reducers: {
    setDisplayMatrix: (state, action: PayloadAction<Matrix>) => {
      state.value = action.payload;
    },
  },
});

export const { setDisplayMatrix } = displayMatrixSlice.actions;
export default displayMatrixSlice.reducer;

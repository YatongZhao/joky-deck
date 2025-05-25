import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HoverState {
  hoveredGearId: string | null;
}

const initialState: HoverState = {
  hoveredGearId: null,
};

const hoverSlice = createSlice({
  name: 'hover',
  initialState,
  reducers: {
    setHoveredGearId: (state, action: PayloadAction<string | null>) => {
      state.hoveredGearId = action.payload;
    },
  },
});

export const { setHoveredGearId } = hoverSlice.actions;
export default hoverSlice.reducer; 
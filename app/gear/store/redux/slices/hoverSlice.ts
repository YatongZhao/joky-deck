import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface HoverState {
  hoveredGearId: string | null;
}

const initialState: HoverState = {
  hoveredGearId: null,
};

export const initializeHoverState = (): HoverState => {
  return initialState;
}

const hoverSlice = createSlice({
  name: 'hover',
  initialState,
  reducers: {
    resetHover: (state) => {
      state.hoveredGearId = null;
    },
    setHoveredGearId: (state, action: PayloadAction<string | null>) => {
      state.hoveredGearId = action.payload;
    },
  },
});

export const { resetHover, setHoveredGearId } = hoverSlice.actions;
export default hoverSlice.reducer; 
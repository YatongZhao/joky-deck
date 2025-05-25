import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TimelineState = {
  speed: number;
  time: number;
}

const initializeTimelineState = (): TimelineState => {
  return {
    speed: 1,
    time: 0,
  }
}

export const timelineSlice = createSlice({
  name: "timeline",
  initialState: initializeTimelineState(),
  reducers: {
    setSpeed: (state, action: PayloadAction<number>) => {
      state.speed = action.payload;
    },
  },
});

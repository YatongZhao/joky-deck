import { GearProjectData, initialGearProject } from "@/app/gear/core/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { debounceTime, distinctUntilChanged, filter, map, Observable, tap } from "rxjs";
import { store } from "..";
import { viewBox$ } from "../..";
import { equals } from "ramda";
import { combineEpics } from "redux-observable";

type ViewBoxState = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const initializeViewBoxState = (gearProject: GearProjectData): ViewBoxState => {
  return gearProject.viewBox;
}

const viewBoxSlice = createSlice({
  name: 'viewBox',
  initialState: initializeViewBoxState(initialGearProject),
  reducers: {
    setViewBox: (state, action: PayloadAction<ViewBoxState>) => action.payload,
    resetViewBox: (state, action: PayloadAction<ViewBoxState>) => action.payload,
  },
});

export const { setViewBox, resetViewBox } = viewBoxSlice.actions;

const isResetViewBoxAction = (action: any): action is ReturnType<typeof resetViewBox> => {
  return action.type === resetViewBox.type;
}

export default viewBoxSlice.reducer;

viewBox$.pipe(
  debounceTime(500),
).subscribe(viewBox => {
  console.log('viewBox', viewBox);
  store.dispatch(setViewBox(viewBox));
});

export const resetViewBoxEpic = (action$: Observable<any>) => action$.pipe(
    filter(isResetViewBoxAction),
    map(action => action.payload),
    distinctUntilChanged<ViewBoxState>(equals),
    tap(viewBox => viewBox$.next(viewBox)),
);

export const viewBoxEpic = combineEpics(resetViewBoxEpic);

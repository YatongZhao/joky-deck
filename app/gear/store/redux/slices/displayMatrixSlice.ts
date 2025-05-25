import { GearProjectData, initialGearProject, Matrix } from "@/app/gear/core/types";
import { matrixToMat3 } from "@/app/gear/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { filter, map, Observable, tap } from "rxjs";
import { ofType } from "redux-observable";
import { displayMatrix$ } from "../..";

type DisplayMatrixState = Matrix;

export const initializeDisplayMatrixState = (gearProject: GearProjectData): DisplayMatrixState => {
  return gearProject.displayMatrix;
}

export const displayMatrixSlice = createSlice({
  name: 'displayMatrix',
  initialState: initializeDisplayMatrixState(initialGearProject),
  reducers: {
    persistDisplayMatrix: (state, action: PayloadAction<Matrix>) => action.payload,
    resetDisplayMatrix: (state, action: PayloadAction<Matrix>) => action.payload,
  },
});

export const { persistDisplayMatrix, resetDisplayMatrix } = displayMatrixSlice.actions;

export default displayMatrixSlice.reducer;

export const displayMatrixEpic = (action$: Observable<any>) => action$.pipe(
  ofType(persistDisplayMatrix.type, resetDisplayMatrix.type),
  map(action => action.payload),
  tap(displayMatrix => displayMatrix$.next(matrixToMat3(displayMatrix))),
  filter(() => false)
);

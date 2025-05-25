import { GearProjectData, initialGearProject, Matrix } from "@/app/gear/core/types";
import { matrixToMat3 } from "@/app/gear/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { filter, map, Observable, tap } from "rxjs";
import { combineEpics } from "redux-observable";
import { displayMatrix$ } from "../..";

type DisplayMatrixState = Matrix;

export const initializeDisplayMatrixState = (gearProject: GearProjectData): DisplayMatrixState => {
  return gearProject.displayMatrix;
}

export const displayMatrixSlice = createSlice({
  name: 'displayMatrix',
  initialState: initializeDisplayMatrixState(initialGearProject),
  reducers: {
    setDisplayMatrix: (state, action: PayloadAction<Matrix>) => action.payload,
    resetDisplayMatrix: (state, action: PayloadAction<Matrix>) => action.payload,
  },
});

export const { setDisplayMatrix, resetDisplayMatrix } = displayMatrixSlice.actions;

const isResetDisplayMatrixAction = (action: any): action is ReturnType<typeof resetDisplayMatrix> => {
    return action.type === resetDisplayMatrix.type;
}

export default displayMatrixSlice.reducer;

export const resetDisplayMatrixEpic = (action$: Observable<any>) => action$.pipe(
    filter(isResetDisplayMatrixAction),
    map(action => action.payload),
    tap(displayMatrix => displayMatrix$.next(matrixToMat3(displayMatrix))),
    filter(() => false)
);

export const displayMatrixEpic = combineEpics(resetDisplayMatrixEpic);

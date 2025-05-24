import { GearProjectData, initialGearProject, Matrix } from "@/app/gear/core/types";
import { mat3ToMatrix, matrixToMat3 } from "@/app/gear/utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { debounceTime, distinctUntilChanged, filter, map, Observable, tap } from "rxjs";
import { store } from "..";
import { equals } from "ramda";
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

displayMatrix$.pipe(
  debounceTime(500),
).subscribe(displayMatrix => {
  store.dispatch(setDisplayMatrix(mat3ToMatrix(displayMatrix)));
});

export const resetDisplayMatrixEpic = (action$: Observable<any>) => action$.pipe(
    filter(isResetDisplayMatrixAction),
    map(action => action.payload),
    distinctUntilChanged<Matrix>(equals),
    tap(displayMatrix => displayMatrix$.next(matrixToMat3(displayMatrix)))
);

export const displayMatrixEpic = combineEpics(resetDisplayMatrixEpic);

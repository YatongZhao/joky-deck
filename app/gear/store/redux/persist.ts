import { createSelector } from "@reduxjs/toolkit";
import { AppThunk, RootState, store } from ".";
import { GearProjectData } from "../../core/types";
import { initializeGearsState, resetGears, selectAllGears } from "./slices/gearsSlice";
import { initializeModuleState, resetModule } from "./slices/moduleSlice";
import { initializeDisplayMatrixState, persistDisplayMatrix, resetDisplayMatrix } from "./slices/displayMatrixSlice";
import { initializeViewBoxState, resetViewBox } from "./slices/viewBoxSlice";
import { initializeUndoManagerState } from "./slices/undoManagerSlice";
import { setEditorMachine, editorMachineSelector, initializeEditorMachineState, setEditorMachineId } from "./slices/editorMachineSlice";
import { editorMachine } from "../../editorMachine";
import { Snapshot } from "xstate";
import { __internal_virtual_gear_id__ } from "../../constant";
import { debounceTime, filter, Observable, tap } from "rxjs";
import { ofType } from "redux-observable";
import { undoableActionTypes } from "./undoableEpic";
import { setGearProjectDataToLocalStorage } from "../localStorage";
import { initializeHoverState, resetHover } from "./slices/hoverSlice";

export const loadGearProjectData = (gearProject: GearProjectData): AppThunk => (dispatch) => {
  dispatch(resetGears(gearProject.gears));
  dispatch(resetModule(gearProject.module));
  dispatch(resetDisplayMatrix(gearProject.displayMatrix));
  dispatch(resetViewBox(gearProject.viewBox));
  dispatch(setEditorMachine(gearProject.editorMachineState));
  dispatch(resetHover());
}

export const rootStateToGearProjectData = (state: RootState): GearProjectData => {
  return {
    version: '1.0.0',
    gears: selectAllGears(state).filter((gear) => gear.id !== __internal_virtual_gear_id__),
    module: state.module.value,
    displayMatrix: state.displayMatrix,
    viewBox: state.viewBox,
    editorMachineState: editorMachineSelector(state)?.getPersistedSnapshot() as Snapshot<typeof editorMachine>,
  }
}

export const gearProjectDataToRootState = (gearProject: GearProjectData): RootState => {
  return {
    gears: initializeGearsState(gearProject),
    module: initializeModuleState(gearProject),
    displayMatrix: initializeDisplayMatrixState(gearProject),
    viewBox: initializeViewBoxState(gearProject),
    undoManager: initializeUndoManagerState(gearProject),
    editorMachine: initializeEditorMachineState(gearProject),
    hover: initializeHoverState(),
  };
}

export const gearProjectDataSelector = createSelector(
  (state: RootState) => state,
  (state): GearProjectData => rootStateToGearProjectData(state),
);

export const persistEpic = (action$: Observable<any>) => action$.pipe(
  ofType(
    ...undoableActionTypes,
    persistDisplayMatrix.type,
    setEditorMachineId.type,
    resetViewBox.type,
    resetGears.type,
    resetModule.type,
    resetDisplayMatrix.type,
  ),
  debounceTime(100),
  tap(() => setGearProjectDataToLocalStorage(gearProjectDataSelector(store.getState()))),
  filter(() => false)
);

import { createSelector } from "@reduxjs/toolkit";
import { AppThunk, RootState, store } from ".";
import { GearProjectData } from "../../core/types";
import { initializeGearsState, resetGears, selectAllGears } from "./slices/gearsSlice";
import { initializeModuleState, setModule } from "./slices/moduleSlice";
import { initializeDisplayMatrixState, setDisplayMatrix } from "./slices/displayMatrixSlice";
import { initializeViewBoxState, setViewBoxAPoint, setViewBoxBPoint } from "./slices/viewBoxSlice";
import { initializeUndoManagerState } from "./slices/undoManagerSlice";
import { setEditorMachine, editorMachineSelector, initializeEditorMachineState } from "./slices/editorMachineSlice";
import { editorMachine } from "../../editorMachine";
import { Snapshot } from "xstate";

export const loadGearProjectData = (gearProject: GearProjectData): AppThunk => (dispatch) => {
  dispatch(resetGears(gearProject.gears));
  dispatch(setModule(gearProject.module));
  dispatch(setDisplayMatrix(gearProject.displayMatrix));
  dispatch(setViewBoxAPoint(gearProject.viewBox.a));
  dispatch(setViewBoxBPoint(gearProject.viewBox.b));
  dispatch(setEditorMachine(gearProject.editorMachineState));
}

export const rootStateToGearProjectData = (state: RootState): GearProjectData => {
  return {
    version: '1.0.0',
    gears: selectAllGears(state),
    module: state.module.value,
    displayMatrix: state.displayMatrix.value,
    viewBox: { a: state.viewBox.a, b: state.viewBox.b },
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
  };
}

export const gearProjectDataSelector = createSelector(
  (state: RootState) => state,
  (state): GearProjectData => rootStateToGearProjectData(state),
);

export const persistStore = (targetStore: typeof store) => {
  let gearProjectData = gearProjectDataSelector(targetStore.getState());
  targetStore.subscribe(() => {
    const newGearProjectData = gearProjectDataSelector(targetStore.getState());
    if (newGearProjectData !== gearProjectData) {
      // setGearProjectDataToLocalStorage(newGearProjectData);
      console.log(newGearProjectData);
      gearProjectData = newGearProjectData;
    } else {
      console.log('no change');
    }
  });
}

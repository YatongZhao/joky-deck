import { createSelector } from "@reduxjs/toolkit";
import { AppThunk, RootState, store } from ".";
import { GearProjectData } from "../../core/types";
import { initializeGearsState, resetGears, selectAllGears } from "./slices/gearsSlice";
import { initializeModuleState, setModule } from "./slices/moduleSlice";
import { initializeDisplayMatrixState, resetDisplayMatrix } from "./slices/displayMatrixSlice";
import { initializeViewBoxState, resetViewBox } from "./slices/viewBoxSlice";
import { initializeUndoManagerState, setUndoManager } from "./slices/undoManagerSlice";
import { setEditorMachine, editorMachineSelector, initializeEditorMachineState } from "./slices/editorMachineSlice";
import { editorMachine } from "../../editorMachine";
import { Snapshot } from "xstate";

export const loadGearProjectData = (gearProject: GearProjectData): AppThunk => (dispatch) => {
  dispatch(resetGears(gearProject.gears));
  dispatch(setModule(gearProject.module));
  dispatch(resetDisplayMatrix(gearProject.displayMatrix));
  dispatch(resetViewBox(gearProject.viewBox));
  dispatch(setEditorMachine(gearProject.editorMachineState));
  dispatch(setUndoManager(gearProject));
}

export const rootStateToGearProjectData = (state: RootState): GearProjectData => {
  return {
    version: '1.0.0',
    gears: selectAllGears(state).filter((gear) => gear.id !== '__internal_virtual_gear_id__'),
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
      // console.log(newGearProjectData);
      gearProjectData = newGearProjectData;
    } else {
      console.log('no change');
    }
  });
}

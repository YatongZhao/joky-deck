import { createSelector } from "@reduxjs/toolkit";
import { AppThunk, RootState, store } from ".";
import { GearProjectData } from "../../core/types";
import { resetGears, selectAllGears } from "./slices/gearsSlice";
import { setModule } from "./slices/moduleSlice";
import { setDisplayMatrix } from "./slices/displayMatrixSlice";
import { setViewBoxAPoint, setViewBoxBPoint } from "./slices/viewBoxSlice";
import { setUndoManager } from "./slices/undoManagerSlice";
import { createUndoRedoManager } from "../undoRedoManager";
import { setEditorMachine, editorMachineSelector } from "./slices/editorMachineSlice";
import { editorMachine } from "../../editorMachine";
import { Snapshot } from "xstate";

export const initializeStore = (gearProject: GearProjectData): AppThunk => (dispatch) => {
  dispatch(resetGears(gearProject.gears));
  dispatch(setModule(gearProject.module));
  dispatch(setDisplayMatrix(gearProject.displayMatrix));
  dispatch(setViewBoxAPoint(gearProject.viewBox.a));
  dispatch(setViewBoxBPoint(gearProject.viewBox.b));
  dispatch(setEditorMachine(gearProject.editorMachineState));
  dispatch(setUndoManager(createUndoRedoManager(gearProject)));
}

export const gearProjectDataSelector = createSelector(
  (state: RootState) => state,
  (state): GearProjectData => {
    return {
      version: '1.0.0',
      gears: selectAllGears(state),
      module: state.module.value,
      displayMatrix: state.displayMatrix.value,
      viewBox: { a: state.viewBox.a, b: state.viewBox.b },
      editorMachineState: editorMachineSelector(state)?.getPersistedSnapshot() as Snapshot<typeof editorMachine>,
    };
  }
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

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createUndoRedoManager, UndoRedoManager, pushUndoRedoNode, undoUndoRedoNode, redoUndoRedoNode } from "../../undoRedoManager";
import { GearProjectData, initialGearProject } from "@/app/gear/core/types";
import { editorMachine } from "@/app/gear/editorMachine";
import { Actor, Snapshot } from "xstate";
import { AppThunk } from "..";
import { selectAllGears } from "./gearsSlice";
import { initializeStore } from "../persist";

const initialState: UndoRedoManager<GearProjectData> = createUndoRedoManager(initialGearProject);

const undoManagerSlice = createSlice({
  name: "undoManager",
  initialState,
  reducers: {
    setUndoManager: (state, action: PayloadAction<UndoRedoManager<GearProjectData>>) => action.payload,
    pushUndo: (state, action: PayloadAction<UndoRedoManager<GearProjectData>>) => action.payload,
    undo: (state, action: PayloadAction<UndoRedoManager<GearProjectData>>) => action.payload,
    redo: (state, action: PayloadAction<UndoRedoManager<GearProjectData>>) => action.payload,
  },
});

const { setUndoManager, pushUndo: _pushUndo, undo: _undo, redo: _redo } = undoManagerSlice.actions;
export { setUndoManager };

export const pushUndo = (editorMachineActor: Actor<typeof editorMachine>): AppThunk => (dispatch, getState) => {
  const currentState = getState();
  const currentUndoManager = currentState.undoManager;
  const newUndoManager = pushUndoRedoNode(currentUndoManager, {
    version: '1.0.0',
    displayMatrix: currentState.displayMatrix.value,
    gears: selectAllGears(currentState),
    module: currentState.module.value,
    viewBox: {
      a: currentState.viewBox.a,
      b: currentState.viewBox.b,
    },
    editorMachineState: editorMachineActor.getPersistedSnapshot() as Snapshot<typeof editorMachine>,
  });
  dispatch(_pushUndo(newUndoManager));
}

export const undo = (): AppThunk => (dispatch, getState) => {
  const currentState = getState();
  const currentUndoManager = currentState.undoManager;
  const newUndoManager = undoUndoRedoNode(currentUndoManager);
  if (newUndoManager === currentUndoManager) return;
  const data = newUndoManager.current.value;
  dispatch(initializeStore(data));
  dispatch(_undo(newUndoManager));
}

export const redo = (): AppThunk => (dispatch, getState) => {
  const currentState = getState();
  const currentUndoManager = currentState.undoManager;
  const newUndoManager = redoUndoRedoNode(currentUndoManager);
  if (newUndoManager === currentUndoManager) return;
  const data = newUndoManager.current.value;
  dispatch(initializeStore(data));
  dispatch(_redo(newUndoManager));
}

export default undoManagerSlice.reducer;

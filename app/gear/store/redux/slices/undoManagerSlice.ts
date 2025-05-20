import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GearProjectData, initialGearProject } from "@/app/gear/core/types";
import { AppThunk } from "..";
import { loadGearProjectData, rootStateToGearProjectData } from "../persist";
import UndoManager, { UndoManagerState } from "../../undoManager";
type UndoData = {
  gearProject: GearProjectData;
  description: string;
}

export const initializeUndoManagerState = (gearProject: GearProjectData): UndoManagerState<UndoData> => {
  return UndoManager.createUndoManager({
    gearProject,
    description: 'initial',
  });
}
const undoManagerSlice = createSlice({
  name: "undoManager",
  initialState: initializeUndoManagerState(initialGearProject),
  reducers: {
    setUndoManager: (state, action: PayloadAction<GearProjectData>) => {
      return initializeUndoManagerState(action.payload);
    },
    _pushUndo: (state, action: PayloadAction<UndoData>) => UndoManager.pushState<UndoData>(state as unknown as UndoManagerState<UndoData>, action.payload),
    _undo: (state) => UndoManager.undo(state as unknown as UndoManagerState<UndoData>),
    _redo: (state) => UndoManager.redo(state as unknown as UndoManagerState<UndoData>),
  },
});

const { setUndoManager, _pushUndo, _undo, _redo } = undoManagerSlice.actions;
export { setUndoManager };

export const pushUndo = (description: string): AppThunk => (dispatch, getState) => {
  const currentState = getState();
  dispatch(_pushUndo({
    gearProject: rootStateToGearProjectData(currentState),
    description,
  }));
}

export const undo = (): AppThunk => (dispatch, getState) => {
  const currentState = getState();
  const currentUndoManager = currentState.undoManager;
  if (UndoManager.canUndo(currentUndoManager)) {
    const newUndoManager = UndoManager.undo(currentUndoManager);
    const data = newUndoManager.present.gearProject;
    dispatch(loadGearProjectData(data));
    dispatch(_undo());
  }
}

export const redo = (): AppThunk => (dispatch, getState) => {
  const currentState = getState();
  const currentUndoManager = currentState.undoManager;
  if (UndoManager.canRedo(currentUndoManager)) {
    const newUndoManager = UndoManager.redo(currentUndoManager);
    const data = newUndoManager.present.gearProject;
    dispatch(loadGearProjectData(data));
    dispatch(_redo());
  }
}

export default undoManagerSlice.reducer;

import { editorMachine } from "@/app/gear/editorMachine";
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Actor, createActor, Snapshot } from "xstate";
import { AppThunk, RootState, store } from "..";
import { GearProjectData, initialGearProject } from "@/app/gear/core/types";

const editorMachineMap = new Map<string, Actor<typeof editorMachine>>();

const createEditorMachine = (currentId: string, snapshot?: Snapshot<typeof editorMachine> | null) => {
  const currentEditorMachineActor = editorMachineMap.get(currentId);
  if (currentEditorMachineActor) {
    currentEditorMachineActor.stop();
    editorMachineMap.delete(currentId);
  }
  const editorMachineActor = createActor(editorMachine, {
    snapshot: snapshot ?? undefined,
  }).start();
  editorMachineMap.set(editorMachineActor.id, editorMachineActor);
  return editorMachineActor;
}

const getEditorMachine = (id: string) => {
  const editorMachineActor = editorMachineMap.get(id);
  if (!editorMachineActor) {
    throw new Error('EditorMachineActor not found');
  }
  return editorMachineActor;
}

export const initializeEditorMachineState = (gearProject: GearProjectData) => {
  const editorMachineActor = createEditorMachine('', gearProject.editorMachineState);
  return {
    id: editorMachineActor.id,
    snapshot: editorMachineActor.getPersistedSnapshot() as Snapshot<typeof editorMachine>,
  };
}

const editorMachineSlice = createSlice({
  name: 'editorMachine',
  initialState: initializeEditorMachineState(initialGearProject),
  reducers: {
    setEditorMachineId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    persistEditorMachineSnapshot: (state, action: PayloadAction<Snapshot<typeof editorMachine>>) => {
      return {
        ...state,
        snapshot: action.payload,
      }
    },
  },
});

export const editorMachineSelector = createSelector(
  (state: RootState) => state.editorMachine.id,
  (id) => getEditorMachine(id),
);

export const canAddGearSelector = createSelector(
  (state: RootState) => state.editorMachine.snapshot,
  () => {
    return getEditorMachine(store.getState().editorMachine.id)
      .getSnapshot()
      .can({ type: 'enterAddingMode' });
  },
);

export const canEscSelector = createSelector(
  (state: RootState) => state.editorMachine.snapshot,
  () => {
    return getEditorMachine(store.getState().editorMachine.id)
      .getSnapshot()
      .can({ type: 'esc' });
  },
);

export const editorMachineSendSelector = createSelector(
  (state: RootState) => state.editorMachine.id,
  (id) => {
    const editorMachineActor = getEditorMachine(id);
    const safeSend = (event: Parameters<typeof editorMachineActor.send>[0]) => {
      const snapshot = editorMachineActor.getSnapshot();
      if (snapshot.can(event)) {
        editorMachineActor.send(event);
        switch (event.type) {
          case 'enterAddingMode':
            break;
          default:
            store.dispatch(persistEditorMachineSnapshot(editorMachineActor.getPersistedSnapshot() as Snapshot<typeof editorMachine>));
        }
        return true;
      }
      return false;
    };
    return safeSend;
  },
);


export const setEditorMachine = (snapshot?: Snapshot<typeof editorMachine> | null): AppThunk => (dispatch, getState) => {
  const currentEditorMachineId = getState().editorMachine.id;
  const editorMachineActor = createEditorMachine(currentEditorMachineId, snapshot);
  dispatch(editorMachineSlice.actions.setEditorMachineId(editorMachineActor.id));
}

export const {
  setEditorMachineId,
  persistEditorMachineSnapshot,
} = editorMachineSlice.actions;

export default editorMachineSlice.reducer;

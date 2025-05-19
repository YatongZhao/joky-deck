import { editorMachine } from "@/app/gear/editorMachine";
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Actor, createActor, Snapshot } from "xstate";
import { AppThunk, RootState } from "..";

type EditorMachineState = {
  id: string;
};

const editorMachineMap = new Map<string, Actor<typeof editorMachine>>();

const editorMachineActor = createActor(editorMachine);
editorMachineMap.set(editorMachineActor.id, editorMachineActor);
editorMachineActor.subscribe((state) => {
  console.log(state);
});

const initialEditorMachineState: EditorMachineState = {
  id: editorMachineActor.id,
};
const editorMachineSlice = createSlice({
  name: 'editorMachine',
  initialState: initialEditorMachineState,
  reducers: {
    setEditorMachineId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
  },
});

export const editorMachineSelector = createSelector(
  (state: RootState) => state.editorMachine.id,
  (id) => {
    const editorMachineActor = editorMachineMap.get(id);
    if (!editorMachineActor) {
      throw new Error('EditorMachineActor not found');
    }
    return editorMachineActor;
  },
);

export const editorMachineSendSelector = createSelector(
  (state: RootState) => state.editorMachine.id,
  (id) => {
    const editorMachineActor = editorMachineMap.get(id);
    if (!editorMachineActor) {
      throw new Error('EditorMachineActor not found');
    }
    const snapshot = editorMachineActor.getSnapshot();
    const safeSend = (event: Parameters<typeof editorMachineActor.send>[0]) => {
      if (snapshot.can(event)) {
        editorMachineActor.send(event);
        return true;
      }
      return false;
    };
    return safeSend;
  },
);


export const setEditorMachine = (snapshot?: Snapshot<typeof editorMachine> | null): AppThunk => (dispatch, getState) => {
  const currentEditorMachineId = getState().editorMachine.id;
  const currentEditorMachineActor = editorMachineMap.get(currentEditorMachineId);
  if (currentEditorMachineActor) {
    currentEditorMachineActor.stop();
    editorMachineMap.delete(currentEditorMachineId);
  }
  const editorMachineActor = createActor(editorMachine, { snapshot: snapshot ?? undefined }).start();
  editorMachineMap.set(editorMachineActor.id, editorMachineActor);
  editorMachineActor.subscribe((state) => {
    console.log(state);
  });
  dispatch(editorMachineSlice.actions.setEditorMachineId(editorMachineActor.id));
}

export default editorMachineSlice.reducer;

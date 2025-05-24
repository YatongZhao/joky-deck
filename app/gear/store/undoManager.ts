export type UndoManagerState<T> = {
  past: T[];      // History of previous states
  present: T;     // Current state
  future: T[];    // States that can be redone
};

const createUndoManager = <T>(initialState: T): UndoManagerState<T> => {
  return {
    past: [],
    present: initialState,
    future: [],
  };
};

const pushState = <T>(state: UndoManagerState<T>, newState: T): UndoManagerState<T> => {
  return {
    past: [...state.past, state.present],
    present: newState,
    future: [], // Clear future states when new state is pushed
  };
};

const undo = <T>(state: UndoManagerState<T>): UndoManagerState<T> => {
  if (state.past.length === 0) {
    return state;
  }

  const previous = state.past[state.past.length - 1]!;
  const newPast = state.past.slice(0, -1);

  return {
    past: newPast,
    present: previous,
    future: [state.present, ...state.future],
  };
};

const redo = <T>(state: UndoManagerState<T>): UndoManagerState<T> => {
  if (state.future.length === 0) {
    return state;
  }

  const next = state.future[0]!;
  const newFuture = state.future.slice(1);

  return {
    past: [...state.past, state.present],
    present: next,
    future: newFuture,
  };
};

const canUndo = <T>(state: UndoManagerState<T>): boolean => {
  return state.past.length > 0;
};

const canRedo = <T>(state: UndoManagerState<T>): boolean => {
  return state.future.length > 0;
};

// Helper function to create a full undo manager with all methods
const createUndoManagerWithMethods = <T>(initialState: T) => {
  let currentState = createUndoManager(initialState);

  return {
    getState: () => currentState,
    push: (newState: T) => {
      currentState = pushState(currentState, newState);
      return currentState;
    },
    undo: () => {
      currentState = undo(currentState);
      return currentState;
    },
    redo: () => {
      currentState = redo(currentState);
      return currentState;
    },
    canUndo: () => canUndo(currentState),
    canRedo: () => canRedo(currentState),
  };
};

const UndoManager = {
  createUndoManager,
  createUndoManagerWithMethods,
  pushState,
  undo,
  redo,
  canUndo,
  canRedo,
}

export default UndoManager;

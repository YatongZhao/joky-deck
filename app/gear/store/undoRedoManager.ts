type UndoRedoNode<T> = {
  value: T;
  prev: UndoRedoNode<T> | null;
  next: UndoRedoNode<T> | null;
};

export type UndoRedoManager<T> = {
  current: UndoRedoNode<T>;
};

export const createUndoRedoManager = <T>(initialValue: T): UndoRedoManager<T> => {
  const current = {
    value: initialValue,
    prev: null,
    next: null,
  };

  return {
    current,
  };
};

export const pushUndoRedoNode = <T>(manager: UndoRedoManager<T>, value: T): UndoRedoManager<T> => {
  const newNode = {
    value,
    prev: manager.current,
    next: null,
  };

  manager.current.next = newNode;
  return {
    current: newNode,
  }
};

export const undoUndoRedoNode = <T>(manager: UndoRedoManager<T>): UndoRedoManager<T> => {
  if (manager.current.prev === null) {
    return manager;
  }

  return { current: manager.current.prev };
};

export const redoUndoRedoNode = <T>(manager: UndoRedoManager<T>): UndoRedoManager<T> => {
  if (manager.current.next === null) {
    return manager;
  }

  return { current: manager.current.next };
};

export const getUndoRedoNode = <T>(manager: UndoRedoManager<T>): T => {
  return manager.current.value;
};

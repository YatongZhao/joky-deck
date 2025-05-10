import { useGearProjectStore } from "../../store";

export const useUndoRedoController = () => {
  const undo = useGearProjectStore((state) => state.undo);
  const redo = useGearProjectStore((state) => state.redo);
  const undoRedoManager = useGearProjectStore((state) => state.undoRedoManager);

  const canUndo = undoRedoManager.current.prev !== null;
  const canRedo = undoRedoManager.current.next !== null;

  return { undo, redo, canUndo, canRedo };
}

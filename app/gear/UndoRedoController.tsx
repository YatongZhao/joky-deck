import { useGearProjectStore } from "./store";

export const UndoRedoController = () => {
  const undo = useGearProjectStore((state) => state.undo);
  const redo = useGearProjectStore((state) => state.redo);
  const undoRedoManager = useGearProjectStore((state) => state.undoRedoManager);

  const canUndo = undoRedoManager.current.prev !== null;
  const canRedo = undoRedoManager.current.next !== null;
  
  return (
    <div>
      <button onClick={undo} disabled={!canUndo}>Undo</button>
      <button onClick={redo} disabled={!canRedo}>Redo</button>
    </div>
  );
};

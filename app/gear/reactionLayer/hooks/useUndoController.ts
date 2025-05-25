import { useAppDispatch, useAppSelector } from "../../store/redux";
import { undo as undoAction, redo as redoAction } from "../../store/redux/slices/undoManagerSlice";
import { useCallback } from "react";
import UndoManager from "../../store/undoManager";
import { useHotkeys } from "react-hotkeys-hook";

export const useUndoController = () => {
  const dispatch = useAppDispatch();
  const undo = useCallback(() => {
    dispatch(undoAction());
  }, [dispatch]);
  const redo = useCallback(() => {
    dispatch(redoAction());
  }, [dispatch]);
  const canUndo = useAppSelector((state) => UndoManager.canUndo(state.undoManager));
  const canRedo = useAppSelector((state) => UndoManager.canRedo(state.undoManager));
  useHotkeys('mod+z', () => {
    dispatch(undoAction());
  }, { enabled: canUndo });
  useHotkeys('mod+shift+z', () => {
    dispatch(redoAction());
  }, { enabled: canRedo });
  return { undo, redo, canUndo, canRedo };
}

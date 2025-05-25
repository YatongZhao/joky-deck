import { useCallback } from "react";
import { initialGearProject } from "../../core/types";
import { loadGearProjectData } from "../../store/redux/persist";
import { useAppDispatch } from "../../store/redux";
import { setUndoManager } from "../../store/redux/slices/undoManagerSlice";

export const useResetCanvas = () => {
  const dispatch = useAppDispatch();
  return useCallback(() => {
    dispatch(loadGearProjectData(initialGearProject));
    dispatch(setUndoManager(initialGearProject));
  }, [dispatch]);
}

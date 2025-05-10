import { useCallback } from "react";
import { useGearProjectStore } from "../../store";
import { initialGearProject } from "../../core/types";

export const useResetCanvas = () => {
  const setGearProject = useGearProjectStore((state) => state.setGearProject);
  return useCallback(() => {
    setGearProject(initialGearProject);
  }, [setGearProject]);
}

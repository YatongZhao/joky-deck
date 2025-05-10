import { useCallback } from "react";
import { getGearProjectSnapshot } from "../../store";
import { saveAs } from "file-saver";

export const useExportProject = () => {
  return useCallback(() => {
    const gearProjectJson = JSON.stringify(getGearProjectSnapshot());
    saveAs(new Blob([gearProjectJson], { type: 'application/json' }), 'gear-project.json');
  }, []);
}

import { useCallback } from "react";
import { saveAs } from "file-saver";
import { store } from "../../store/redux";
import { rootStateToGearProjectData } from "../../store/redux/persist";

export const useExportProject = () => {
  return useCallback(() => {
    const gearProjectJson = JSON.stringify(rootStateToGearProjectData(store.getState()));
    saveAs(new Blob([gearProjectJson], { type: 'application/json' }), 'gear-project.json');
  }, []);
}

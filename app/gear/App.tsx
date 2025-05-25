import { Provider } from "react-redux";
import { GearProject } from "./GearProject";
import { store, useAppDispatch } from "./store/redux";
import { Suspense, useCallback } from "react";
import { loadGearProjectData } from "./store/redux/persist";
import { GearProjectData } from "./core/types";
import { DropZoneContainer } from "./DropZoneContainer";
import { setUndoManager } from "./store/redux/slices/undoManagerSlice";

const PersistenceManager = () => {
  const dispatch = useAppDispatch();

  const handleLoadProject = useCallback((gearProject: GearProjectData) => {
    dispatch(loadGearProjectData(gearProject));
    dispatch(setUndoManager(gearProject));
  }, [dispatch]);

  return <DropZoneContainer<GearProjectData> onJsonLoad={handleLoadProject}>
    <GearProject />
  </DropZoneContainer>;
}
export const App = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Provider store={store}>
        <PersistenceManager />
      </Provider>
    </Suspense>
  );
};

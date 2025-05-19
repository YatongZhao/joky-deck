import { Provider } from "react-redux";
import { GearProject } from "./GearProject";
import { store, useAppDispatch } from "./store/redux";
import { Suspense, useCallback, useEffect } from "react";
import { getGearProjectDataFromLocalStorage } from "./store/localStorage";
import { initializeStore } from "./store/redux/persist";
import { initialGearProject, GearProjectData } from "./core/types";
import { DropZoneContainer } from "./DropZoneContainer";
import { useGearProjectStore } from "./store";

const PersistenceManager = () => {
  const setGearProject = useGearProjectStore((state) => state.setGearProject);
  const dispatch = useAppDispatch();

  const handleLoadProject = useCallback((gearProject: GearProjectData) => {
    setGearProject(gearProject);
    dispatch(initializeStore(gearProject));
  }, [dispatch, setGearProject]);

  useEffect(() => {
    const localStorageGearProjectData = getGearProjectDataFromLocalStorage();
    handleLoadProject(localStorageGearProjectData || initialGearProject);
  }, [handleLoadProject]);

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

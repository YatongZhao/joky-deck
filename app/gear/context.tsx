import { createContext, useContext, useState } from "react";
import { GearProjectData, mockGearProject } from "./core/types.";

export const GearProjectContext = createContext<{
  activeGearId: string | null;
  setActiveGearId: (id: string | null) => void;
  gearProject: GearProjectData;
}>({
  activeGearId: null,
  setActiveGearId: () => {},
  gearProject: mockGearProject,
});

export const GearProjectProvider = ({ gearProject, children }: {
  gearProject: GearProjectData,
  children: React.ReactNode,
}) => {
  const [activeGearId, setActiveGearId] = useState<string | null>(null);

  return (
    <GearProjectContext.Provider
      value={{
        activeGearId,
        setActiveGearId,
        gearProject,
      }}>
      {children}
    </GearProjectContext.Provider>
  );
};

export const useGearProject = () => {
  return useContext(GearProjectContext);
};

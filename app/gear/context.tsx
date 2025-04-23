import { createContext, Dispatch, SetStateAction, useContext, useState } from "react";
import { GearData, GearProjectData, mockGearProject } from "./core/types.";

export const GearProjectContext = createContext<{
  activeGearId: string | null;
  setActiveGearId: Dispatch<SetStateAction<string | null>>;
  gearProject: GearProjectData;
  addGear: (gear: GearData) => void;
  scale: number;
}>({
  activeGearId: null,
  setActiveGearId: () => {},
  gearProject: mockGearProject,
  addGear: () => {},
  scale: 1,
});

export const GearProjectProvider = ({ gearProject, addGear, scale, children }: {
  gearProject: GearProjectData,
  addGear: (gear: GearData) => void,
  scale: number,
  children: React.ReactNode,
}) => {
  const [activeGearId, setActiveGearId] = useState<string | null>(null);

  return (
    <GearProjectContext.Provider
      value={{
        activeGearId,
        setActiveGearId,
        gearProject,
        addGear,
        scale,
      }}>
      {children}
    </GearProjectContext.Provider>
  );
};

export const useGearProject = () => {
  return useContext(GearProjectContext);
};

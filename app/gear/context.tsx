import { createContext, useContext, useState } from "react";
import { GearData } from "./core/types.";

export const GearGroupContext = createContext<{
  activeGearId: string | null;
  setActiveGearId: (id: string | null) => void;
  durationUnit: number;
  module: number;
  color: string;
  hoverColor: string;
  gears: GearData[];
}>({
  activeGearId: null,
  setActiveGearId: () => {},
  durationUnit: 1,
  module: 5,
  color: 'black',
  hoverColor: 'black',
  gears: [],
});

export const GearGroupProvider = ({ durationUnit, module, color, hoverColor, gears, children }: {
  durationUnit: number,
  module: number,
  color: string,
  hoverColor: string,
  gears: GearData[],
  children: React.ReactNode,
}) => {
  const [activeGearId, setActiveGearId] = useState<string | null>(null);

  return (
    <GearGroupContext.Provider
      value={{
        activeGearId,
        setActiveGearId,
        durationUnit,
        module,
        color,
        hoverColor,
        gears,
      }}>
      {children}
    </GearGroupContext.Provider>
  );
};

export const useGearGroup = () => {
  return useContext(GearGroupContext);
};

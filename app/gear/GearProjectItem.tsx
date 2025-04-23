import { useGearProject } from "./context";
import { Gear } from "./Gear";

export const GearProjectItem: React.FC<{ gearId: string; isRoot?: boolean }> = ({ gearId, isRoot = false }) => {
  const { gearProject, activeGearId, setActiveGearId } = useGearProject();
  const gearData = isRoot ? gearProject.rootGear : gearProject.gears.find(gear => gear.id === gearId);
  const gearChildren = gearProject.gears.filter(gear => gear.parentId === gearId);

  const active = gearData?.id === activeGearId;

  if (!gearData) {
    return `Error: Gear(${gearId}) not found`;
  }

  return <Gear
    teeth={gearData.teeth}
    positionAngle={gearData.positionAngle}
    module={gearProject.module}
    durationUnit={gearProject.durationUnit}
    active={active}
    onClick={() => setActiveGearId(gearData.id)}
  >
    {gearChildren.map(child => <GearProjectItem key={child.id} gearId={child.id} />)}
  </Gear>
}

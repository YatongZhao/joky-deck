import { AngleSlider, Paper } from "@mantine/core"
import { useGear } from "./store";
import { useGearProjectStore } from "./store";

export const GearSettingPanel = () => {
  const activeGearId = useGearProjectStore((state) => state.activeGearId);
  const activeGear = useGear(activeGearId);
  const setGearPositionAngle = useGearProjectStore((state) => state.setGearPositionAngle);
  
  const handlePositionAngleChange = (value: number) => {
    if (activeGearId) {
      setGearPositionAngle(activeGearId, (value - 90 + 360) % 360);
    }
  }

  const positionAngle = activeGear?.positionAngle || 0;

  return (
    <Paper pos="fixed" right={10} top={10} shadow="md" fz="xs" style={{ zIndex: 1000 }}>
      settings
      {activeGearId && <AngleSlider
        size={60}
        thumbSize={8}
        value={positionAngle + 90}
        onChange={handlePositionAngleChange}
        formatLabel={(value) => `${(value - 90 + 360) % 360}`}
      />}
    </Paper>
  )
}

import { AngleSlider, ColorInput, DEFAULT_THEME, Paper } from "@mantine/core"
import { useGear } from "./store";
import { useGearProjectStore } from "./store";
import { EditorMachineContext } from "./editorMachine";
export const GearSettingPanel = () => {
  const activeGearId = EditorMachineContext.useSelector((state) => state.context.selectedGearId);
  const activeGear = useGear(activeGearId);
  const setGearPositionAngle = useGearProjectStore((state) => state.setGearPositionAngle);
  const setGearColor = useGearProjectStore((state) => state.setGearColor);
  
  const handlePositionAngleChange = (value: number) => {
    if (activeGearId) {
      setGearPositionAngle(activeGearId, (value - 90 + 360) % 360);
    }
  }

  const handleColorChange = (value: string) => {
    if (activeGearId) {
      setGearColor(activeGearId, value);
    }
  }

  const positionAngle = activeGear?.positionAngle || 0;
  const color = activeGear?.color || '';

  return (
    <Paper pos="fixed" p="xs" right={10} top={10} shadow="md" fz="xs" style={{ zIndex: 1000 }}>
      settings
      {activeGearId && (
        <>
          <AngleSlider
            size={60}
            thumbSize={8}
            value={positionAngle + 90}
            onChange={handlePositionAngleChange}
            formatLabel={(value) => `${(value - 90 + 360) % 360}`}
          />
          <ColorInput
            closeOnColorSwatchClick
            size="xs"
            value={color}
            onChange={handleColorChange}
            placeholder="Click color swatch"
            swatches={[
              ...DEFAULT_THEME.colors.red,
              ...DEFAULT_THEME.colors.green,
              ...DEFAULT_THEME.colors.blue,
            ]}
          /> 
        </>)}
    </Paper>
  )
}

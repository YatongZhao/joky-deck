import { AngleSlider, ColorInput, DEFAULT_THEME, NumberInput, Paper, Stack } from "@mantine/core"
import { useGear } from "../store";
import { useGearProjectStore } from "../store";
import { useSelector } from "@xstate/react";
import { REACTION_LAYER_OFFSET } from "../constant";

export const GearSettingPanel = () => {
  const editorMachineActor = useGearProjectStore((state) => state.editorMachineActor);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  const activeGear = useGear(activeGearId);
  const setGearPositionAngle = useGearProjectStore((state) => state.setGearPositionAngle);
  const setGearColor = useGearProjectStore((state) => state.setGearColor);
  const setGearTeeth = useGearProjectStore((state) => state.setGearTeeth);
  const pushUndo = useGearProjectStore((state) => state.pushUndo);
  
  const handlePositionAngleChange = (value: number) => {
    if (activeGearId) {
      setGearPositionAngle(activeGearId, (value - 90 + 360) % 360);
    }
  }

  const handleColorChange = (value: string) => {
    if (activeGearId) {
      const isColorChanged = setGearColor(activeGearId, value);
      if (isColorChanged) {
        pushUndo("Change Gear Color");
      }
    }
  }

  const handleTeethChange = (value: number | string) => {
    if (activeGearId) {
      const isTeethChanged = setGearTeeth(activeGearId, Number(value));
      if (isTeethChanged) {
        pushUndo("Change Gear Teeth");
      }
    }
  }

  const positionAngle = activeGear?.positionAngle || 0;
  const color = activeGear?.color || '';

  if (!activeGearId) return null;

  return (
    <Paper pos="fixed" p="md" left={REACTION_LAYER_OFFSET} top={REACTION_LAYER_OFFSET + 100} shadow="md" fz="xs" style={{ zIndex: 10 }} w={180}>
      <Stack gap="md">
        <AngleSlider
          size={150}
          thumbSize={8}
          value={positionAngle + 90}
          onChange={handlePositionAngleChange}
          onChangeEnd={() => pushUndo("Change Gear Position Angle")}
          formatLabel={(value) => `${((value - 90 + 360) % 360).toFixed(0)}`}
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
        <NumberInput
          size="xs"
          value={activeGear?.teeth}
          onChange={handleTeethChange}
        />
      </Stack>
    </Paper>
  )
}

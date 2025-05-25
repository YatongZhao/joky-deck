import { AngleSlider, ColorInput, DEFAULT_THEME, NumberInput, Paper, Stack } from "@mantine/core"
import { useSelector } from "@xstate/react";
import { REACTION_LAYER_OFFSET } from "../constant";
import { useAppDispatch, useAppSelector } from "../store/redux";
import { editorMachineSelector } from "../store/redux/slices/editorMachineSlice";
import { selectGearById, updateGear, persistGear } from "../store/redux/slices/gearsSlice";

export const GearSettingPanel = () => {
  const dispatch = useAppDispatch();
  const editorMachineActor = useAppSelector(editorMachineSelector);
  const activeGearId = useSelector(editorMachineActor, (state) => state.context.selectedGearId);
  const activeGear = useAppSelector((state) => selectGearById(state, activeGearId ?? ''));
  
  const handlePositionAngleChange = (value: number) => {
    if (activeGearId) {
      dispatch(updateGear({ id: activeGearId, changes: { positionAngle: (value - 90 + 360) % 360 } }));
    }
  }

  const handleColorChange = (value: string) => {
    if (activeGearId) {
      dispatch(persistGear({ id: activeGearId, changes: { color: value } }));
    }
  }

  const handleTeethChange = (value: number | string) => {
    if (activeGearId) {
      dispatch(persistGear({ id: activeGearId, changes: { teeth: Number(value) } }));
    }
  }

  const handleSpeedChange = (value: number | string) => {
    if (activeGearId) {
      dispatch(persistGear({ id: activeGearId, changes: { speed: Number(value) } }));
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
          onChangeEnd={(value) => {
            if (activeGearId) {
              dispatch(persistGear({ id: activeGearId, changes: { positionAngle: (value - 90 + 360) % 360 } }));
            }
          }}
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
        <NumberInput
          size="xs"
          value={activeGear?.speed}
          onChange={handleSpeedChange}
        />
      </Stack>
    </Paper>
  )
}

import { Group, Paper, UnstyledButton } from "@mantine/core"
import { MousePointer2, StickyNote } from "lucide-react"
import classes from "./ToolsPanel.module.scss"
import classNames from "classnames"
import { useSelector } from "@xstate/react"
import { useMemo } from "react"
import { REACTION_LAYER_OFFSET } from "../constant"
import { useAppSelector } from "../store/redux"
import { editorMachineSelector, editorMachineSendSelector } from "../store/redux/slices/editorMachineSlice"
// import { useTheme } from "@/app/gear/theme"

enum Tool {
  Selecting = 'Selecting',
  ViewportSetting = 'ViewportSetting',
}

export const ToolsPanel = () => {
  // const theme = useTheme();
  const editorMachineActor = useAppSelector(editorMachineSelector);
  const state = useSelector(editorMachineActor, (state) => state);
  const editorMachineSend = useAppSelector(editorMachineSendSelector);
  const value = useMemo(() => {
    if (state.matches('Selecting')) return Tool.Selecting;
    if (state.matches('ViewportSetting')) return Tool.ViewportSetting;
    return Tool.Selecting;
  }, [state]);

  const handleChange = (tool: Tool) => {
    switch (tool) {
      case Tool.Selecting:
        editorMachineSend({ type: 'enterSelecting' });
        break;
      case Tool.ViewportSetting:
        editorMachineSend({ type: 'enterViewPortSetting' });
        break;
    }
  }

  return (
    <Paper pos="fixed" top={REACTION_LAYER_OFFSET - 6} right="50%" style={{ transform: 'translateX(50%)' }} withBorder
      p="xs" radius="md" className={classes.toolsPanel}
    >
      <Group gap="xs">
        <UnstyledButton className={classNames(classes.toolItem, {
          [classes.active!]: value === Tool.Selecting,
        })} onClick={() => handleChange(Tool.Selecting)}>
          <MousePointer2 size={18} strokeWidth={1} fill={value === Tool.Selecting ? 'black' : 'none'} />
        </UnstyledButton>
        <UnstyledButton className={classNames(classes.toolItem, {
          [classes.active!]: value === Tool.ViewportSetting,
        })} onClick={() => handleChange(Tool.ViewportSetting)}>
          <StickyNote size={18} strokeWidth={1} fill={value === Tool.ViewportSetting ? 'black' : 'none'} />
        </UnstyledButton>
      </Group>
    </Paper>
  )
}

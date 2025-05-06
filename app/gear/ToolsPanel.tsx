import { SegmentedControl } from "@mantine/core";
import { useMemo } from "react";
import { MousePointer2, StickyNote } from "lucide-react";
import { useSelector } from "@xstate/react";
import { useGearProjectStore } from "./store";

enum Tool {
  Selecting = 'Selecting',
  ViewportSetting = 'ViewportSetting',
}

export const ToolsPanel = () => {
  const editorMachineActor = useGearProjectStore((state) => state.editorMachineActor);
  const state = useSelector(editorMachineActor, (state) => state);
  const { send } = editorMachineActor;
  const value = useMemo(() => {
    if (state.matches('Selecting')) return Tool.Selecting;
    if (state.matches('ViewportSetting')) return Tool.ViewportSetting;
    return Tool.Selecting;
  }, [state]);

  const handleChange = (value: string) => {
    send(value === Tool.Selecting ? { type: 'enterSelecting' } : { type: 'enterViewPortSetting' });
  }

  return <SegmentedControl
    size="md"
    pos="fixed"
    top={10}
    left="50%"
    style={{ transform: 'translateX(-50%)' }}
    value={value}
    onChange={handleChange}
    withItemsBorders={false}
    data={[
      { label: <MousePointer2 size={12} transform="scale(1.5)" fill="currentColor" />, value: Tool.Selecting },
      { label: <StickyNote size={12} transform="scale(1.5)" />, value: Tool.ViewportSetting },
    ]}
  />
};

import { ActionIcon, Menu } from "@mantine/core";
import { Download, ImagePlay, MenuIcon, Trash2 } from "lucide-react";
import { useExportProject } from "./hooks/useExportProject";
import { useExportSvg } from "./hooks/useExportSvg";
import { REACTION_LAYER_OFFSET } from "../constant";
import { useResetCanvas } from "./hooks/useResetCanvas";

export const GearProjectMenu: React.FC = () => {
  const handleExportProject = useExportProject();
  const handleExportSvg = useExportSvg();
  const handleResetCanvas = useResetCanvas();

  return (
    <Menu>
      <Menu.Target>
        <ActionIcon pos="fixed" top={REACTION_LAYER_OFFSET} left={REACTION_LAYER_OFFSET} variant="filled">
          <MenuIcon size={16} /> 
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<Download size={16} />} onClick={handleExportProject}>Export gear project</Menu.Item>
        <Menu.Item leftSection={<ImagePlay size={16} />} onClick={handleExportSvg}>Export as SVG</Menu.Item>
        <Menu.Item leftSection={<Trash2 size={16} />} onClick={handleResetCanvas}>Reset the canvas</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

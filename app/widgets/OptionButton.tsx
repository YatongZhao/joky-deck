import { Box, MantineStyleProps } from "@mantine/core";
import { PanelButton } from "../components/PanelButton";

export const OptionButton: React.FC<{ h?: MantineStyleProps['h'] }> = ({ h }) => {
  return (
    <PanelButton
      h={h}
      buttonColor="orange.5"
    >
      <Box fz={14}>Options</Box>
    </PanelButton>
  );
}

export const SideOptionButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return <PanelButton
    buttonColor="orange.5"
    onClick={onClick}
  >
    <Box fz={8} fw={900} m={4}>Options</Box>
  </PanelButton>
}

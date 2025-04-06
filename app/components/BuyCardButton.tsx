import { PanelButton } from "./PanelButton";
import { Box } from "@mantine/core";

export const BuyCardButton = ({ onBuy }: { onBuy: () => void }) => {
  return <Box pos="absolute" top="100%" left="50%" style={{ transform: 'translateX(-50%)' }}>
    <PanelButton buttonColor="green.5" onClick={onBuy}>
      <Box p={2} fz={10}>BUY</Box>
    </PanelButton>
  </Box>
}

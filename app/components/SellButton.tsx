import { PanelButton } from "./PanelButton";
import { Box } from "@mantine/core";

export const SellButton = ({ price, onSell }: { price: number, onSell: () => void }) => {
  return <Box pos="absolute" left="100%" top="50%" style={{ transform: 'translateY(-50%)', zIndex: 1000 }}>
    <PanelButton buttonColor="red.5" onClick={onSell}>
      <Box p={2} fz={10}>出售{price}$</Box>
    </PanelButton>
  </Box>
}

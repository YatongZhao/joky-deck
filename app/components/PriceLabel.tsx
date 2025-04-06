import { Box } from "@mantine/core";
import { CardInfoContainer } from "./CardInfoContainer";
export const PriceLabel = ({ price }: { price: number }) => {
  return <Box pos="absolute" bottom="calc(2px * var(--mantine-scale) + 100%)" left="50%" style={{ transform: 'translateX(-50%)' }}>
    <CardInfoContainer>
      <Box fz={8} fw="bold">{price}$</Box>
    </CardInfoContainer>
  </Box>
};

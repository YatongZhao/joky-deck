import { Box, Flex } from "@mantine/core"
import { useGame } from "../GameContext";
import { useValue } from "../hooks/useValue";

export const MoneyCard = () => {
  const game = useGame();
  const money = useValue(game.money);

  return <Flex
    h={50}
    fz={66}
    fw={900}
    justify="center"
    align="center"
    style={{ borderRadius: 5, overflow: 'hidden' }}
    bg="orange.5"
    c="white"
    px={3}
  >
    <Box pos="relative">{money}</Box>
    <Box fz={22} pos="relative" top={15}>$</Box>
  </Flex>
}

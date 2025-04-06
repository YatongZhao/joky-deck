import { Box, Flex } from "@mantine/core"
import { useContext } from "react";
import { GameContext } from "../GameContext";
import { useValue } from "../hooks/useValue";

export const MoneyCard = () => {
  const game = useContext(GameContext);
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
    <Box pos="relative" top={-4}>{money}</Box>
    <Box fz={22} pos="relative" top={31}>$</Box>
  </Flex>
}

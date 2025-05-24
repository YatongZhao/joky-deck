import { Box, rgba } from "@mantine/core";
import { Group } from "@mantine/core";
import { Flex } from "@mantine/core";
import { useValue } from "../hooks/useValue";
import { useGame } from "../GameContext";
import { useTheme } from "../theme";
import { useAnimatedValue } from "../hooks/useAnimatedValue";
import { useEffect } from "react";
import { wait } from "../utils/wait";

export const RoundScoreCard: React.FC = () => {
  const theme = useTheme();
  const game = useGame();
  const round = useValue(game.round);
  const scoreRef = useAnimatedValue<HTMLDivElement>(round.score);
  
  useEffect(() => {
    const flushToRoundScoreEffect = round.flushToRoundScoreEffect.add(async () => {
      await wait(800);
    });

    return () => {
      flushToRoundScoreEffect.remove();
    };
  }, [round]);

  return <Group gap={0} p={5} pl={0} style={{ borderRadius: 5 }} bg={rgba(theme.colors.gameMain?.[4] ?? 'white', 0.8)} justify="flex-end">
    <Flex style={{ flexGrow: 0 }} justify="center">
      <Box w={40} lh={1} mx={10} fz={12} fw={900} c="white" ta="center">Round Score</Box>
    </Flex>
    <Box
      ref={scoreRef}
      fw={900}
      style={{ borderRadius: 5, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      bg={theme.colors.gameMain?.[9]} c="white" fz={28} lh={1} pb={3}
    />
  </Group>
}

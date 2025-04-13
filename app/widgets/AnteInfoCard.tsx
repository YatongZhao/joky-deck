import { Box, Group, Stack, Text } from "@mantine/core"
import { useValue } from "../hooks/useValue";
import { useTheme } from "../theme";
import { useGame } from "../GameContext";

export const AnteInfoCard = () => {
  const game = useGame();
  const round = useValue(game.round);
  const roundNumber = useValue(game.roundNumber);
  const anteNumber = useValue(game.anteNumber);
  const theme = useTheme();
  const blindDescription = useValue(round.blind.description);

  return <Stack
    gap={6}
    align="center"
    bg={theme.colors.gameMain[9]}
    style={{ borderRadius: 5, flexShrink: 1 }}
    py={10}
    px={10}
    h="100%"
    justify="center"
    ta="center"
  >
    <Box fz={30} lh={1} c="red.6">{round.blind.name}</Box>
    <Box fz={12} lh={1} c="red.6" my={6}>{blindDescription}</Box>
    <Box fz={14} lh={1} c="white">Ante {anteNumber + 1}/8</Box>
    <Box fz={14} lh={1} c="white">Round {roundNumber}</Box>
    <Box fz={14} lh={1} c="white">At Least</Box>
    <Box fz={30} lh={1} c="red.6">{round.targetScore}</Box>
    <Group gap={0} fz={12} lh={1} c="white">Reward:<Text lh={1} c="orange.3" component="span" fw="bold">{'$'.repeat(round.blind.reward)}</Text></Group>
  </Stack>
}

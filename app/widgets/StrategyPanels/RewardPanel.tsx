import { Box, Divider, Group, rgba, Stack } from "@mantine/core"
import { useTheme } from "../../theme";
import { useValue } from "../../hooks/useValue";
import { PanelButton } from "../../components/PanelButton";
import { DrawerContainer } from "../../components/DrawerContainer";
import { useGame } from "../../GameContext";

export const RewardPanel = () => {
  const game = useGame();
  const round = useValue(game.round);
  const theme = useTheme();

  const handleCashOut = () => {
    game.cashOut();
  }

  return <DrawerContainer>
    <Stack
      align="center"
      w="100%"
      bg={rgba(theme.colors.gameMain[4], 0.8)}
      style={{ borderRadius: 10 }}
    >
      <PanelButton onClick={handleCashOut} mt={8} w={300} h={40} buttonColor="orange.4">
        <Box fz={30}>Cash Out: ${round.blind.reward}</Box>
      </PanelButton>
      <Group px={10} w="100%" justify="space-between">
        <Stack gap={0} align="center">
          <Box fz={12} lh={1} c="white">At Least</Box>
          <Box fz={30} lh={1} c="red.6">{round.targetScore}</Box>
        </Stack>
        <Box c="orange.3" fz={26}>{'$'.repeat(round.blind.reward)}</Box>
      </Group>
      <Divider mb={10} w={370} c="white" size="lg" variant="dotted" />
    </Stack>
  </DrawerContainer>
}

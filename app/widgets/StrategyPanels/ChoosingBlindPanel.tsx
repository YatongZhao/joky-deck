import { Box, Card, Grid, Group, Stack, Text } from "@mantine/core"
import { useGame } from "../../GameContext";
import { useValue } from "../../hooks/useValue";
import { RoundStage, Blind, getBlindTargetScore } from "@yatongzhao/joky-deck-core";
import { PanelButton } from "../../components/PanelButton";
import { useTheme } from "@/app/theme";
import { useMemo } from "react";

const BlindTab = ({ active, blind, disableSkip }: { active: boolean; blind: Blind; disableSkip?: boolean }) => {
  const game = useGame();
  const theme = useTheme();
  const anteNumber = useValue(game.anteNumber);
  const targetScore = useMemo(() => getBlindTargetScore(blind, anteNumber), [blind, anteNumber]);
  
  const handleSelect = () => {
    game.round.value.stage.setValue(RoundStage.strategy);
  }

  const handleSkipBlind = () => {
    game.trySkipBlind();
  }

  return <Card h={260} bg={active ? theme.colors.gameMain[8] : theme.colors.gameMain[1]} pb={8}>
    <Stack align="center" justify="space-between" h="100%">
      <Stack w="100%" align="center" justify="center" gap={10}>
        <Box c={active ? "red.6" : theme.colors.gameMain[8]} fz={14} fw={900}>{blind.name}</Box>
        <Box fz={10} ta="center" c={active ? "white" : theme.colors.gameMain[8]}>{blind.description}</Box>
      </Stack>
      <Stack w="100%" align="center">
        <Stack gap={2} w="100%" align="center">
          <Box fz={10} lh={1} c={active ? "white" : theme.colors.gameMain[8]}>At Least</Box>
          <Box fz={18} lh={1} c={active ? "red.6" : theme.colors.gameMain[8]}>{targetScore}</Box>
        </Stack>
        <Group gap={0} fz={12} lh={1} c={active ? "white" : theme.colors.gameMain[8]}>
          Reward:
          <Text ml={8} fz={20} lh={1} c={active ? "orange.3" : theme.colors.gameMain[8]} component="span" fw="bold">{'$'.repeat(blind.reward)}</Text>
        </Group>
        <Stack h={40} gap={5} mt={10} w="100%">
          {active && <>
            <PanelButton w="100%" fw={900} h={20} fz={10} buttonColor={theme.colors.gameMain[3]} onClick={handleSelect}>Select</PanelButton>
            {!disableSkip && <PanelButton w="100%" fw={900} h={20} fz={10} buttonColor={theme.colors.gameMain[3]} onClick={handleSkipBlind}>Skip Blind</PanelButton>}
          </>}
        </Stack>
      </Stack>
    </Stack>
  </Card>
}

export const ChoosingBlindPanel = () => {
  const game = useGame();
  const blindNumber = useValue(game.blindNumber);
  const anteLevelBlinds = useValue(game.anteLevelBlinds);

  return <Grid gutter={6} px={50}>
    {anteLevelBlinds.map((blind, index) => (
      <Grid.Col span={4} key={blind.name} pt={40}>
        <BlindTab active={blindNumber === index} disableSkip={index === anteLevelBlinds.length - 1} blind={blind} />
      </Grid.Col>
    ))}
  </Grid>
}

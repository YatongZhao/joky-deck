import { Card, Group, Stack } from "@mantine/core"
import { useGame } from "../../GameContext";
import { useValue } from "../../hooks/useValue";
import { RoundStage } from "@yatongzhao/joky-deck-core";
import { PanelButton } from "../../components/PanelButton";

const BlindTab = ({ active, title, disableSkip }: { active: boolean; title: string; disableSkip?: boolean }) => {
  const game = useGame();
  
  const handleSelect = () => {
    game.round.value.stage.setValue(RoundStage.strategy);
  }

  const handleSkipBlind = () => {
    game.trySkipBlind();
  }

  return <Stack align="center" w={60}>
    {title}
    {active && <>
      <PanelButton w={50} h={20} fz={10} buttonColor="red.5" onClick={handleSelect}>Select</PanelButton>
      {!disableSkip && <PanelButton w={50} h={20} fz={10} buttonColor="red.5" onClick={handleSkipBlind}>Skip Blind</PanelButton>}
    </>}
  </Stack>
}

export const ChoosingBlindPanel = () => {
  const game = useGame();
  const blindNumber = useValue(game.blindNumber);

  return <Card withBorder w="fit-content">
    <Group align="flex-start">
      <BlindTab active={blindNumber === 0} title="Small Blind" />
      <BlindTab active={blindNumber === 1} title="Big Blind" />
      <BlindTab active={blindNumber === 2} disableSkip title="BOSS" />
    </Group>
  </Card>
}

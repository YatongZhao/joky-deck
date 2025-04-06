import { Group } from "@mantine/core"
import { PanelButton } from "../components/PanelButton"
import { useGame } from "../GameContext";
import { useValue } from "../hooks/useValue";
import { BulletBar } from "../components/BulletBar";

export const HandButtonSection: React.FC<{
  handleDiscard: () => void;
  handlePlayHand: () => void;
}> = ({ handleDiscard, handlePlayHand }) => {
  const game = useGame();
  const round = useValue(game.round);

  const maxHandsNumber = useValue(game.hands);
  const hands = useValue(round.hands);
  const maxDiscardsNumber = useValue(game.discards);
  const discards = useValue(round.discards);

  return <Group fw="bold" gap={5} align="center">
    <BulletBar max={maxHandsNumber} current={hands} direction="ltr" color="blue.6" />
    <PanelButton w={100} h={25} buttonColor="blue.6" onClick={handlePlayHand}>
      Play Hand
    </PanelButton>
    <PanelButton w={100} h={25} buttonColor="red.6" onClick={handleDiscard}>
      Discard
    </PanelButton>
    <BulletBar max={maxDiscardsNumber} current={discards} direction="rtl" color={'red.6'} />
  </Group>
}

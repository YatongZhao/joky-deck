import { Group, Text } from "@mantine/core"
import { PanelButton } from "../components/PanelButton"
import { useGame } from "../GameContext";
import { SortHandCardsBy } from "@yatongzhao/joky-deck-core";

export const SortHandSection = () => {
  const game = useGame();

  const sortHandCardsByValue = () => {
    game.sortHandCardsBy.setValue(SortHandCardsBy.Value);
  }

  const sortHandCardsBySuit = () => {
    game.sortHandCardsBy.setValue(SortHandCardsBy.Suit);
  }

  return <Group gap={5}>
    <PanelButton onClick={sortHandCardsByValue} w={30} h={12} buttonColor="orange.4" fw={900} fz={10}>Rank</PanelButton>
    <Text ff="monospace" lh={1} fw={900} fz={8} pos="relative" top={1}>Sort Hand</Text>
    <PanelButton onClick={sortHandCardsBySuit} w={30} h={12} buttonColor="orange.4" fw={900} fz={10}>Suit</PanelButton>
  </Group>
}

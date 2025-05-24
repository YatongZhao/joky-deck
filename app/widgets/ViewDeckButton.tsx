import { Box, Group, Modal, Stack } from "@mantine/core"
import { PanelButton } from "../components/PanelButton"
import { useGame } from "../GameContext";
import { useDisclosure } from "@mantine/hooks";
import { CardScene } from "./CardScene";
import { useValue } from "../hooks/useValue";
import { useDraggableCards } from "./DraggableCardList";
import { useMemo } from "react";
import { Value, Suits } from "@yatongzhao/joky-deck-core";
import { useTheme } from "../theme";

const CardListBySuit = ({ suit }: { suit: Suits }) => {
  const game = useGame();
  const round = useValue(game.round);
  const cardsBySuit$ = useMemo(() => {
    return new Value(round.cardPool.value.filter(card => card.suit.value === suit).sort((a, b) => a.label.value.valueOrder - b.label.value.valueOrder));
  }, [round, suit]);
  const { handleDrag, positionSignalMap } = useDraggableCards({
    cards$: cardsBySuit$,
    gap: 105,
  });
  const cardsBySuit = useValue(cardsBySuit$);

  return <>
    {cardsBySuit.map((card, i) => (
      <CardScene
        key={card.id}
        card={card}
        positionSignal={positionSignalMap[card.id]!}
        onDrag={(props) => handleDrag(i, props)}
      />
    ))}
  </>
}

export const CardViewDeckButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const theme = useTheme();
  return <PanelButton buttonColor={theme.colors.gameMain![5]} w={50} h={70} onClick={onClick}>
    <Box fz={8}>View Deck</Box>
  </PanelButton>
}

export const SideViewDeckButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const theme = useTheme();

  return <PanelButton buttonColor={theme.colors.gameMain![5]} onClick={onClick}>
    <Box fz={11} mt={2} fw={900}>View</Box>
    <Box fz={12} mb={4} fw={900}>Deck</Box>
  </PanelButton>
}

export const ViewDeck: React.FC<{ Button: React.FC<{ onClick?: () => void }> }> = ({ Button }) => {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button onClick={open} />
      <Modal opened={opened} onClose={close} size={1000} title="View Deck">
        <Group py={20}>
          <Box w={50}></Box>
          <Stack h={300} gap={75}>
            <Box>
              <CardListBySuit suit={Suits.diamond} />
            </Box>
            <Box>
              <CardListBySuit suit={Suits.club} />
            </Box>
            <Box>
              <CardListBySuit suit={Suits.heart} />
            </Box>
            <Box>
              <CardListBySuit suit={Suits.spade} />
            </Box>
          </Stack>
        </Group>
      </Modal>
    </>
  )
}

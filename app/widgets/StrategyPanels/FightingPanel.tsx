import { useGame } from "@/app/GameContext";
import { useValue } from "@/app/hooks/useValue";
import { Box, Stack } from "@mantine/core"
import { CardScene } from "../CardScene";
import { useDraggableCards } from "../DraggableCardList";
import { HandButtonSection } from "../HandButtonSection";
import { SortHandSection } from "../SortHandSection";
import { HandScoreDashboard } from "../HandScoreDashboard";

export const FightingPanel = () => {
  const game = useGame();
  const round = useValue(game.round);
  
  const handCards = useValue(round.handCards);

  const selectedCards = useValue(round.selectedCards);

  const { handleDrag, positionSignalMap } = useDraggableCards({
    cards$: round.handCards,
    gap: 90,
  });

  return <>
    <Stack gap={5} justify="flex-end" align="center" h="100%">
      <Box h={80} w={47 * handCards.length}>
        {handCards.map((card, i) => (
          <CardScene
            key={card.id}
            onClick={(card) => round.changeSelectedCard(card)}
            active={selectedCards.includes(card)}
            card={card}
            positionSignal={positionSignalMap[card.id]!}
            onDrag={(props) => handleDrag(i, props)}
          />
        ))}
      </Box>
      <HandScoreDashboard />
      <SortHandSection />
      <Box mt={20}>
        <HandButtonSection
          handleDiscard={() => round.discard()}
          handlePlayHand={() => round.playHand()}
        />
      </Box>
    </Stack>
  </>
}

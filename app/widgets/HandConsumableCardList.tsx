import { Box, rgba } from "@mantine/core"
import { useTheme } from "../theme";
import { useValue } from "../hooks/useValue";
import { useDraggableCards } from "./DraggableCardList";
import { useGame } from "../GameContext";
import { ConsumableCardWidget } from "./ConsumableCardWidget";

export const HandConsumableCardList = () => {
  const theme = useTheme();
  const game = useGame();
  const handConsumableCards = useValue(game.handConsumableCards);

  const { handleDrag, positionSignalMap } = useDraggableCards({
    cards$: game.handConsumableCards,
    gap: 130,
  });

  return (
    <Box h={95} style={{ borderRadius: 5 }} p={7} bg={rgba(theme.colors.gameMain[4], 0.8)}>
      {handConsumableCards.map((card, i) => (
        <ConsumableCardWidget
          key={card.id}
          card={card}
          onDrag={(props) => handleDrag(i, props)}
          onUse={(card) => game.useConsumableCard(card)}
          onSell={(card) => game.sellCard(card)}
          positionSignal={positionSignalMap[card.id]}
        />
      ))}
    </Box>
  )
}

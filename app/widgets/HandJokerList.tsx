import { Box, rgba } from "@mantine/core"
import { useTheme } from "../theme";
import { useValue } from "../hooks/useValue";
import { JokerCardWidget } from "./JokerCardWidget";
import { useDraggableCards } from "./DraggableCardList";
import { useGame } from "../GameContext";

export const HandJokerList = () => {
  const theme = useTheme();
  const game = useGame();
  const handJokerCards = useValue(game.handJokerCards);

  const { handleDrag, positionSignalMap } = useDraggableCards({
    cards$: game.handJokerCards,
    gap: 130,
  });

  return (
    <Box h={95} style={{ borderRadius: 5 }} p={7} bg={rgba(theme.colors.gameMain?.[4] ?? 'white', 0.8)}>
      {handJokerCards.map((joker, i) => (
        <JokerCardWidget
          key={joker.id}
          joker={joker}
          onSell={(joker) => game.sellCard(joker)}
          onDrag={(props) => handleDrag(i, props)}
          positionSignal={positionSignalMap[joker.id]!}
        />
      ))}
    </Box>
  )
}

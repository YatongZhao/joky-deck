import { Box } from "@mantine/core";
import { JokerCardWidget } from "./JokerCardWidget";
import { Config, Game, Value } from "@yatongzhao/joky-deck-core";
import { useMemo } from "react";
import { useDraggableCards } from "./DraggableCardList";

export const DevJokers = ({ config }: { config: Config }) => {
  const jokers$ = useMemo(() => {
    const game = new Game(config);
    const jokers = config.jokers.map(joker => {
      return joker.creator(game);
    });
    return new Value(jokers);
  }, [config]);

  const { handleDrag, positionSignalMap } = useDraggableCards({
    cards$: jokers$,
    gap: 120,
  });

  return <Box pos="relative" left={-100}>
    {jokers$.value.map((joker, i) => (
      <JokerCardWidget key={joker.id} joker={joker} positionSignal={positionSignalMap[joker.id]} onDrag={(props) => handleDrag(i, props)} />
    ))}
  </Box>
}

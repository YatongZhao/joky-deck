import { Box, Stack } from "@mantine/core";
import { JokerCardWidget } from "./JokerCardWidget";
import { Config, Game, JokerCard, Value } from "@yatongzhao/joky-deck-core";
import { useMemo } from "react";
import { useDraggableCards } from "./DraggableCardList";
import { splitEvery } from "ramda";

export const JokerRow = ({ jokers }: { jokers: JokerCard[] }) => {
  const jokers$ = useMemo(() => {
    return new Value(jokers);
  }, [jokers]);

  const { handleDrag, positionSignalMap } = useDraggableCards({
    cards$: jokers$,
    gap: 120,
  });

  return <Box>
    {jokers.map((joker, i) => (
      <JokerCardWidget key={joker.id} joker={joker} positionSignal={positionSignalMap[joker.id]} onDrag={(props) => handleDrag(i, props)} />
    ))}
  </Box>
}

export const DevJokers = ({ config }: { config: Config }) => {
  const jokerRows = useMemo(() => {
    const game = new Game(config);
    const jokers = config.jokers.map(joker => {
      return joker.creator(game);
    });
    return splitEvery(10, jokers);
  }, [config]);

  return <Stack pos="relative" left={-295}>
    {jokerRows.map((jokerRow, i) => (
      <Box key={i} h={80}>
        <JokerRow jokers={jokerRow} />
      </Box>
    ))}
  </Stack>
}

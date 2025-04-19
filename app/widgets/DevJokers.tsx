import { Box } from "@mantine/core";
import { JokerCardWidget } from "./JokerCardWidget";
import { Config, Game, JokerCard, Value } from "@yatongzhao/joky-deck-core";
import { useEffect, useMemo, useRef } from "react";
import { useDraggableCards } from "./DraggableCardList";
import { useTheme } from "../theme";

const columns = 10;
const gapX = 125;
const gapY = 180;
const cardWidth = 120;
export const JokerRow = ({ jokers }: { jokers: JokerCard[] }) => {
  const joker$Ref = useRef<Value<JokerCard[]>>(new Value([] as JokerCard[]));
  useEffect(() => {
    joker$Ref.current.setValue(jokers);
  }, [jokers]);

  const jokers$ = joker$Ref.current;

  const { handleDrag, positionSignalMap } = useDraggableCards({
    cards$: jokers$,
    gap: gapX,
    gapY,
    wrap: true,
    columns,
  });

  return <Box>
    {jokers$.value.map((joker, i) => (
      <JokerCardWidget key={joker.id} randomRotate={false} joker={joker} positionSignal={positionSignalMap[joker.id]} onDrag={(props) => handleDrag(i, props)} />
    ))}
  </Box>
}

export const DevJokers = ({ config }: { config: Config }) => {
  const theme = useTheme();
  const jokers = useMemo(() => {
    const game = new Game(config);
    const jokers = config.jokers.map(joker => {
      return joker.creator(game);
    });
    return jokers.sort(() => Math.random() - 0.5);
  }, [config]);

  return <Box px={`${(gapX - cardWidth) / 2 / theme.scale}px`} pos="relative" w={`${gapX / theme.scale * columns}px`} h={`${gapY / theme.scale * ~~(jokers.length / columns + 1)}px`}>
        <JokerRow jokers={jokers} />
  </Box>
}

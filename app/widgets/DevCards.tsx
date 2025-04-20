import { Box } from "@mantine/core";
import { JokerCardWidget } from "./JokerCardWidget";
import { Config, Game, JokerCard, Value, Card, JokerConfig, PlanetConfig, createPlanetFromMetadata, Consumable } from "@yatongzhao/joky-deck-core";
import { useEffect, useMemo, useRef } from "react";
import { useDraggableCards } from "./DraggableCardList";
import { useTheme } from "../theme";
import { CardScene } from "./CardScene";
import { ConsumableCardWidget } from "./ConsumableCardWidget";

type DraggableListConfig = {
  gapX: number;
  gapY: number;
  cardWidth: number;
  columns: number;
}
const DraggableListContainer = ({ children, config, length }: { children: React.ReactNode, config: DraggableListConfig, length: number }) => {
  const theme = useTheme();

  return <Box px={`${(config.gapX - config.cardWidth) / 2 / theme.scale}px`} pos="relative" w={`${config.gapX / theme.scale * config.columns}px`} h={`${config.gapY / theme.scale * ~~(length / config.columns + 1)}px`}>
    {children}
  </Box>
}

const jokerListConfig = {
  gapX: 125,
  gapY: 180,
  cardWidth: 120,
  columns: 10,
}

export const JokerRow = ({ jokers }: { jokers: JokerCard[] }) => {
  const joker$Ref = useRef<Value<JokerCard[]>>(new Value([] as JokerCard[]));
  useEffect(() => {
    joker$Ref.current.setValue(jokers);
  }, [jokers]);

  const jokers$ = joker$Ref.current;

  const { handleDrag, positionSignalMap } = useDraggableCards({
    cards$: jokers$,
    gap: jokerListConfig.gapX,
    gapY: jokerListConfig.gapY,
    wrap: true,
    columns: jokerListConfig.columns,
  });

  return <DraggableListContainer config={jokerListConfig} length={jokers$.value.length}>
    {jokers$.value.map((joker, i) => (
      <JokerCardWidget key={joker.id} randomRotate={false} joker={joker} positionSignal={positionSignalMap[joker.id]} onDrag={(props) => handleDrag(i, props)} />
    ))}
  </DraggableListContainer>
}

export const DevJokers = ({ game, jokerConfigs }: { game: Game, jokerConfigs: JokerConfig[] }) => {
  const jokers = useMemo(() => {
    const jokers = jokerConfigs.map(joker => {
      return joker.creator(game);
    });
    return jokers.sort(() => Math.random() - 0.5);
  }, [game, jokerConfigs]);

  return <JokerRow jokers={jokers} />
}

const cardListConfig = {
  gapX: 94,
  gapY: 166,
  cardWidth: 120,
  columns: 13,
}
export const DevPlayingCards = ({ game }: { game: Game }) => {
  const card$Ref = useRef<Value<Card[]>>(new Value([] as Card[]));
  useEffect(() => {
    card$Ref.current.setValue(game.cardPool.value);
  }, [game]);

  const cards$ = card$Ref.current;

  const { handleDrag, positionSignalMap } = useDraggableCards({
    cards$: cards$,
    gap: cardListConfig.gapX,
    gapY: cardListConfig.gapY,
    wrap: true,
    columns: cardListConfig.columns,
  });

  
  return <DraggableListContainer config={cardListConfig} length={cards$.value.length}>
      {cards$.value.map((card, i) => (
        <CardScene
          key={card.id}
          card={card}
          randomRotate={false}
          positionSignal={positionSignalMap[card.id]}
          onDrag={(props) => handleDrag(i, props)}
        />
    ))}
  </DraggableListContainer>
}

const planetListConfig = {
  gapX: 125,
  gapY: 166,
  cardWidth: 120,
  columns: 10,
}
const DevPlanets = ({ game, planetConfigs }: { game: Game, planetConfigs: PlanetConfig[]   }) => {
  const planets = useMemo(() => {
    return planetConfigs.map(planet => {
      return createPlanetFromMetadata(game, planet.metadata);
    });
  }, [game, planetConfigs]);

  const planets$Ref = useRef<Value<Consumable[]>>(new Value([] as Consumable[]));
  useEffect(() => {
    planets$Ref.current.setValue(planets);
  }, [planets]);

  const planets$ = planets$Ref.current;

  const { handleDrag, positionSignalMap } = useDraggableCards({
    cards$: planets$,
    gap: planetListConfig.gapX,
    gapY: planetListConfig.gapY,
    wrap: true,
    columns: planetListConfig.columns,
  });

  return <DraggableListContainer config={planetListConfig} length={planets$.value.length}>
    {planets$.value.map((planet, i) => (
      <ConsumableCardWidget key={planet.id} card={planet} positionSignal={positionSignalMap[planet.id]} onDrag={(props) => handleDrag(i, props)} />
    ))}
  </DraggableListContainer>
}

export const DevCards = ({ config }: { config: Config }) => {
  const game = useMemo(() => new Game(config), [config]);

  return <>
    <DevJokers game={game} jokerConfigs={config.jokers} />
    <DevPlanets game={game} planetConfigs={config.planets} />
    <DevPlayingCards game={game} />
  </>
}


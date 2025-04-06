import { Box, Grid, Group, rgba, Stack } from "@mantine/core"
import { DrawerContainer } from "../../components/DrawerContainer"
import { PanelButton } from "../../components/PanelButton"
import { JokerCardWidget } from "../JokerCardWidget";
import { useTheme } from "../../theme";
import { useDraggableCards } from "../DraggableCardList";
import { useValue } from "../../hooks/useValue";
import { useGame } from "../../GameContext";
import { JokerCard } from "@yatongzhao/joky-deck-core";
import { ConsumableCardWidget } from "../ConsumableCardWidget";
import { BoosterPackWidget } from "../BoosterPackWidget";
import { UniqType } from "@yatongzhao/joky-deck-core";

export const ShoppingPanel = () => {
  const game = useGame();
  const theme = useTheme();
  const round = useValue(game.round);
  const goods = useValue(round.goods);
  const boosterPacks = useValue(round.boosterPackGoods);
  const rerollPrice = useValue(game.rerollPrice);
  const freeRerollNumber = useValue(round.freeRerollNumber);

  const handleNextRound = () => {
    game.nextRound();
  }

  const { handleDrag, positionSignalMap } = useDraggableCards({
    cards$: round.goods,
    gap: 120,
  });

  const { handleDrag: handleBoosterPackDrag, positionSignalMap: boosterPackPositionSignalMap } = useDraggableCards({
    cards$: round.boosterPackGoods,
    gap: 120,
  });

  return <DrawerContainer>
    <Stack w="100%">
      <Grid gutter={5}>
        <Grid.Col span="content">
          <Stack gap={5}>
            <PanelButton
              w={80}
              h={50}
              buttonColor="red.5"
              onClick={handleNextRound}
            >
              <Box fz={14}>Next</Box>
              <Box>Round</Box>
            </PanelButton>
            <PanelButton
              w={80}
              h={50}
              buttonColor="green.5"
              disabled={freeRerollNumber <= 0 && game.money.value < rerollPrice}
              onClick={() => game.rerollGoods()}
            >
              <Box fz={14}>Reroll</Box>
              <Box>{freeRerollNumber > 0 ? 'Free' : `$${rerollPrice}`}</Box>
            </PanelButton>
          </Stack>
        </Grid.Col>
        <Grid.Col span="auto">
          <Group
            p={8}
            pt={30}
            h={105}
            style={{ borderRadius: 10 }}
            w="100%"
            bg={rgba(theme.colors.gameMain[4], 0.8)}
          >
            {goods.map((card, i) => {
              if (card instanceof JokerCard) {
                return (
                  <JokerCardWidget
                    key={card.id}
                    joker={card}
                    onBuy={(joker) => game.buyCard(joker)}
                    onDrag={(props) => handleDrag(i, props)}
                    positionSignal={positionSignalMap[card.id]}
                    showPrice
                  />
                )
              } else if (card.uniqueType === UniqType.Consumable) {
                return (
                  <ConsumableCardWidget
                    key={card.id}
                    card={card}
                    onBuy={(card) => game.buyCard(card)}
                    onDrag={(props) => handleDrag(i, props)}
                    positionSignal={positionSignalMap[card.id]}
                    showPrice
                  />
                )
              }
            })}
          </Group>
        </Grid.Col>
      </Grid>
      <Grid gutter={5}>
        <Grid.Col span="auto"></Grid.Col>
        <Grid.Col span="content">
          <Stack gap={5} mt={20} w={260}>
            {boosterPacks.map((boosterPack, i) => {
              return <BoosterPackWidget
                key={i}
                boosterPack={boosterPack}
                onBuy={(boosterPack) => game.buyAndUseBoosterPack(boosterPack)}
                onDrag={(props) => handleBoosterPackDrag(i, props)}
                positionSignal={boosterPackPositionSignalMap[boosterPack.id]}
                showPrice
              />
            })}
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  </DrawerContainer>
}

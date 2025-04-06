import { useGame } from "../GameContext"
import { Box, Button, Center, Flex, Grid, Stack, Text } from "@mantine/core";
import { useValue } from "../hooks/useValue";
import { RewardPanel } from "./StrategyPanels/RewardPanel";
import { ShoppingPanel } from "./StrategyPanels/ShoppingPanel";
import { HandJokerList } from "./HandJokerList";
import { RoundStage } from "@yatongzhao/joky-deck-core";
import { ChoosingBlindPanel } from "./StrategyPanels/ChoosingBlindPanel";
import { HandConsumableCardList } from "./HandConsumableCardList";
import { ViewDeck, SideViewDeckButton } from "./ViewDeckButton";
import { FightingPanel } from "./StrategyPanels/FightingPanel";
import { ControlPad } from "./ControlPad";
import { RunInfo, SideRunInfoButton } from "./RunInfoButton";
import { SideOptionButton } from "./OptionButton";

export const CONTROL_PAD_WIDTH = 200;

export const StrategyScene: React.FC<{ onGameOver?: () => void }> = ({ onGameOver }) => {
  const game = useGame();
  const round = useValue(game.round);

  const roundStage = useValue(round.stage);
  
  const gameOver = useValue(game.gameOver);

  if (gameOver) {
    return <Center>
      <Stack>
        <Text>GAME OVER</Text>
        <Button onClick={onGameOver}>Main Menu</Button>
      </Stack>
    </Center>
  }
  
  return <Box w={800} h={450} style={{ outlineWidth: 1, outlineColor: '#ccc', outlineStyle: 'solid', overflow: 'hidden' }} p={3} pos="relative" mt={10}>
    <Grid w={794} gutter={6} columns={30}>
      <Grid.Col span={6}>
        <ControlPad />
      </Grid.Col>
      <Grid.Col span="auto">
        <Flex direction="column" h="100%" gap={6}>
          <Grid gutter={6} columns={15}>
            <Grid.Col span={11}>
              <HandJokerList />
            </Grid.Col>
            <Grid.Col span={4}>
              <HandConsumableCardList />
            </Grid.Col>
          </Grid>
          <Box h="100%">
            <Grid>
              <Grid.Col span={11}>
                <Box h={343}>
                  {roundStage === RoundStage.choosingBlind && <ChoosingBlindPanel />}
                  {roundStage === RoundStage.strategy && <FightingPanel />}
                  {roundStage === RoundStage.reward && <RewardPanel />}
                  {roundStage === RoundStage.shopping && <ShoppingPanel />}
                </Box>
              </Grid.Col>
              <Grid.Col span={1}>
                <Stack gap={5} h="100%" justify="center">
                  <ViewDeck Button={SideViewDeckButton} />
                  <RunInfo Button={SideRunInfoButton} />
                  <SideOptionButton />
                </Stack>
              </Grid.Col>
            </Grid>
          </Box>
        </Flex>
      </Grid.Col>
    </Grid>
  </Box>
}

import { Flex, Text, Group, Stack } from "@mantine/core";
import { useEffect, useState } from "react";
import { useValue } from "../hooks/useValue";
import { useGame } from "../GameContext";
import { wait } from "../utils/wait";
import { valueTypeNames } from "@yatongzhao/joky-deck-core";
import { useAnimatedValue } from "../hooks/useAnimatedValue";

const HAND_SCORE_CARD_HEIGHT = 30;

export const HandScoreCard: React.FC = () => {
  const game = useGame();
  const round = useValue(game.round);
  
  const selectedHandValue = useValue(round.selectedHandValue);
  const selectedScoreFactorLevel = useValue(round.selectedScoreFactorLevel);

  const chipsLabelRef = useAnimatedValue<HTMLDivElement>(round.handChipsFactor);
  const multiRef = useAnimatedValue<HTMLDivElement>(round.handMultiFactor);
  const handScoreRef = useAnimatedValue<HTMLDivElement>(round.handScore);

  useEffect(() => {
    const flushToHandScoreEffect = round.flushToHandScoreEffect.add(async () => {
      setShowHandScore(true);
      await wait(500);
    });

    const flushToRoundScoreEffect = round.flushToRoundScoreEffect.add(async () => {
      await wait(100);
      setShowHandScore(false);
    });

    return () => {
      flushToHandScoreEffect.remove();
      flushToRoundScoreEffect.remove();
    };
  }, [round]);

  const [showHandScore, setShowHandScore] = useState(false);

  return (
    <>
      <Stack
        style={{ borderRadius: 6 }}
        h={HAND_SCORE_CARD_HEIGHT}
        bg="red.9" c="white" justify="center" align="center" gap={6}>
        {showHandScore
          ? <Text ref={handScoreRef} c="white" fw={900} fz={18} lh={1} />
          : (
            <Group align="flex-end" justify="center" gap={2}>
              <Text ff="monospace" fw={900} fz={12} lh={1}>{selectedHandValue ? valueTypeNames[selectedHandValue?.type] : ''}</Text>
              {selectedScoreFactorLevel !== null && <Text ff="monospace" fz={6}>lvl.{selectedScoreFactorLevel + 1}</Text>}
            </Group>
          )
        }
      </Stack>
      <Group w="100%" gap={0} align="center" justify="space-between">
        <Flex ref={chipsLabelRef} c="white" fw={900} fz={18} style={{ borderRadius: 5, flexGrow: 0 }} h={20} w={60} px={4} pb={1} bg="blue.5" align="center" justify="center" />
        <Text c="red.5" fz={18} lh={1} mx={4} pos="relative" top={-2}>X</Text>
        <Flex ref={multiRef} c="white" fw={900} fz={18} style={{ borderRadius: 5, flexGrow: 0 }} h={20} w={60} px={4} pb={1} bg="red.5" align="center" justify="center" />
      </Group>
    </>
  );
}

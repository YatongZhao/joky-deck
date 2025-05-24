import { Badge, Box, Group, MantineStyleProps, Stack, Text } from "@mantine/core"
import { Card, Suits } from "@yatongzhao/joky-deck-core"
import { PositionedCardContainer } from "../components/PositionedCardContainer";
import { BehaviorSubject } from "rxjs";
import { useValue } from "../hooks/useValue";
import { Enhancements } from "@yatongzhao/joky-deck-core";
import { CardInfoContainer } from "../components/CardInfoContainer";
import { useHover } from "@mantine/hooks";
import { useEffect } from "react";
import { wait } from "../utils/wait";
import { pokerFont, useTheme } from "../theme";
import { PlayingCard } from "./PlayingCard";

const SuitIcon = ({ suit, ...styleProps }: { suit: Suits } & MantineStyleProps) => {
  const theme = useTheme();

  return <Text {...styleProps}>
    {suit === 'diamond' && <Box component="span" c={theme.colors.red[7]} className={pokerFont.className}>♦</Box>}
    {suit === 'club' && <Box component="span" c={theme.colors.gameMain?.[8]} className={pokerFont.className}>♣</Box>}
    {suit === 'spade' && <Box component="span" c={theme.colors.gameMain?.[8]} className={pokerFont.className}>♠</Box>}
    {suit === 'heart' && <Box component="span" c={theme.colors.red[7]} className={pokerFont.className}>♥</Box>}
  </Text>
}

export const CardScene: React.FC<{
  card: Card;
  onClick?: (card: Card) => void;
  onDrag?: (props: { active: boolean; movement: [number, number]; }) => void;
  active?: boolean;
  randomRotate?: boolean;
  positionSignal: BehaviorSubject<{ x: number; y: number }>;
}> = ({ card, onClick, active, onDrag, positionSignal, randomRotate = true }) => {
  const enhancement = useValue(card.enhancement);
  const { hovered, ref } = useHover();
  const label = useValue(card.label);
  const suit = useValue(card.suit);

  useEffect(() => {
    const beforeFlushEffect = card.beforeFlushEffect.add(async () => {
      positionSignal.next({ x: 1300, y: 100 });
      await wait(50);
    });
    const afterFlushEffect = card.afterFlushEffect.add(async () => {
      await wait(100);
    });

    return () => {
      beforeFlushEffect.remove();
      afterFlushEffect.remove();
    }
  }, [card, positionSignal]);

  return (
    <PositionedCardContainer
      ref={ref}
      effect={card.emitEffect}
      onClick={() => onClick?.(card)}
      onDrag={onDrag}
      active={active}
      positionSignal={positionSignal}
      randomRotate={randomRotate}
      info={<>
        {hovered && <Box
          pos="absolute"
          bottom={`calc((4px + ${active ? 10 : 0}px) * var(--mantine-scale) + 100%)`}
          left="50%"
          style={{
            transform: 'translateX(-50%)',
            zIndex: 1000,
          }}
        >
          <Stack gap={2} align="center">
            <CardInfoContainer>
              <Stack gap={0} justify="center" align="center">
                <Group gap={2}>
                  <Box fz={8} fw="bold">{label.label}</Box>
                  <SuitIcon suit={suit} fz={6} />
                </Group>
                <Box fz={6}>+{label.point}chips</Box>
              </Stack>
            </CardInfoContainer>
            {enhancement !== Enhancements.None && <CardInfoContainer w="fit-content">
              <Stack gap={0} justify="center" align="center" style={{ flexGrow: 1 }}>
                <Badge size="xs" radius="sm" fullWidth opacity={0.5} color="blue">{enhancement}</Badge>
                {enhancement === Enhancements.Lucky && <>
                  <Box fz={6} w={71} ta="center">1 in 5 chance for +20 Mult</Box>
                  <Box fz={6} w={71} ta="center">1 in 15 chance to win $20</Box>
                </>}
              </Stack>
            </CardInfoContainer>}
          </Stack>
        </Box>}
      </>}
    >
      <PlayingCard label={label.label} suit={suit} />
      {enhancement !== Enhancements.None && <Box pos="absolute" bottom={0} left={0} right={0} p={2}>
        <Badge size="xs" radius="sm" fullWidth opacity={0.5} color="blue">{enhancement}</Badge>
      </Box>}
    </PositionedCardContainer>
  )
}

import { Box, Stack, Text } from "@mantine/core"
import { Consumable } from "@yatongzhao/joky-deck-core"
import { PositionedCardContainer } from "../components/PositionedCardContainer"
import { BehaviorSubject } from "rxjs";
import { PanelButton } from "../components/PanelButton";
import { useHover } from "@mantine/hooks";
import { useValue } from "../hooks/useValue";
import { PriceLabel } from "../components/PriceLabel";
import { SellButton } from "../components/SellButton";
import { BuyCardButton } from "../components/BuyCardButton";
import { Gear } from "./Gear";
import { useTheme } from "../theme";

export const ConsumableCardWidget = ({ card, onBuy, onUse, onSell, onDrag, active, positionSignal, showPrice = false, randomRotate = false }: {
  card: Consumable;
  showPrice?: boolean;
  onBuy?: (card: Consumable) => void;
  onUse?: (card: Consumable) => void;
  onSell?: (card: Consumable) => void;
  onDrag?: (props: { active: boolean; movement: [number, number]; }) => void;
  active?: boolean;
  randomRotate?: boolean;
  positionSignal: BehaviorSubject<{ x: number; y: number }>;
}) => {
  const { hovered, ref } = useHover();
  const description = useValue(card.description);
  const price = useValue(card.price);
  const sellPrice = useValue(card.sellPrice);
  const disable = useValue(card.disable);
  const theme = useTheme();

  return (
    <PositionedCardContainer
      ref={ref}
      hoverToTop
      effect={card.emitEffect}
      onDrag={onDrag}
      active={active}
      randomRotate={randomRotate}
      positionSignal={positionSignal}
      info={<>
        {hovered && onSell && <SellButton price={sellPrice} onSell={() => onSell?.(card)} />}
      </>}
    >
      <Box pos="absolute" top={0} left={0} right={0} bottom={0} style={{ overflow: 'hidden', zIndex: 0 }}>
        <Gear width={200} colors={theme.colors.gameMain} />
      </Box>
      <Stack gap={1} align="center" pos="relative" style={{ zIndex: 1 }}>
        <Text fz={5} fw={900}>{card.name}</Text>
        {card.type === 'Tarot' && (
          <Text fz={6}>Tarot</Text>
        )}
        {card.type === 'Planet' && (
          <Text fz={6}>Planet</Text>
        )}
        <Text ta="center" fz={6} lh={1}>{description}</Text>
      </Stack>
      {hovered && onBuy && <BuyCardButton onBuy={() => onBuy?.(card)} />}
      {hovered && onUse && (
        <Box pos="absolute" top="100%" left="50%" style={{ transform: 'translateX(-50%)' }}>
          <PanelButton disabled={disable} buttonColor="green.5" onClick={() => onUse?.(card)}>
            <Box p={2} fz={10}>use</Box>
          </PanelButton>
        </Box>
      )}
      {showPrice && <PriceLabel price={price} />}
    </PositionedCardContainer>
  );
}

import { Box, Text } from "@mantine/core"
import { PositionedCardContainer } from "../components/PositionedCardContainer"
import { BehaviorSubject } from "rxjs";
import { useHover } from "@mantine/hooks";
import { PriceLabel } from "../components/PriceLabel";
import { BuyCardButton } from "../components/BuyCardButton";
import { BoosterPack } from "@yatongzhao/joky-deck-core";

export const BoosterPackWidget = ({ boosterPack, onBuy, onDrag, active, positionSignal, showPrice = false }: {
  boosterPack: BoosterPack;
  showPrice?: boolean;
  onBuy?: (boosterPack: BoosterPack) => void;
  onDrag?: (props: { active: boolean; movement: [number, number]; }) => void;
  active?: boolean;
  positionSignal: BehaviorSubject<{ x: number; y: number }>;
}) => {
  const { hovered, ref } = useHover();

  return (
    <PositionedCardContainer
      ref={ref}
      hoverToTop
      effect={boosterPack.emitEffect}
      onDrag={onDrag}
      active={active}
      positionSignal={positionSignal}
    >
      <Box>
        <Text fz={12}>{boosterPack.category}</Text>
        <Text fz={6}>{boosterPack.size}</Text>
        <Text fz={6} lh={1}>{boosterPack.description}</Text>
      </Box>
      {hovered && onBuy && <BuyCardButton onBuy={() => onBuy(boosterPack)} />}
      {showPrice && <PriceLabel price={boosterPack.price} />}
    </PositionedCardContainer>
  );
}

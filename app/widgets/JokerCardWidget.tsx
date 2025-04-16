import { JokerCard, JokerCategory, JokerCategoryNames, Editions } from "@yatongzhao/joky-deck-core";
import { Box, Stack } from "@mantine/core";
import { PositionedCardContainer } from "../components/PositionedCardContainer";
import { useHover } from "@mantine/hooks";
import { BehaviorSubject } from "rxjs";
import { useValue } from "../hooks/useValue";
import { PriceLabel } from "../components/PriceLabel";
import { SellButton } from "../components/SellButton";
import { BuyCardButton } from "../components/BuyCardButton";
import { CardInfoContainer } from "../components/CardInfoContainer";
import { useTheme } from "../theme";

const EditionLabel = ({ edition }: { edition: Editions }) => {
  return <Box
    pos="absolute" bottom={0} left={0} right={0} top={0} fz={6} fw="bold" ta="center"
    bg='yellow.3'
    c="dark"
    style={{
      borderRadius: 6,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      paddingBottom: 40,
    }}
  >
      {edition}
  </Box>;
};

const JokerCategoryLabel = ({ category }: { category: JokerCategory }) => {
  const theme = useTheme();
  return <Box
    pos="absolute" bottom={-1} left={-1} right={-1} fz={6} fw="bold" ta="center"
    bg={theme.colors.gameMain[7]}
    c="white"
    style={{
      borderBottomLeftRadius: 6,
      borderBottomRightRadius: 6,
    }}
  >
      {JokerCategoryNames[category]}
  </Box>;
};

export const JokerCardWidget: React.FC<{
  joker: JokerCard;
  showPrice?: boolean;
  onBuy?: (joker: JokerCard) => void;
  onSell?: (joker: JokerCard) => void;
  onClick?: (joker: JokerCard) => void;
  onDrag?: (props: { active: boolean; movement: [number, number]; }) => void;
  active?: boolean;
  positionSignal: BehaviorSubject<{ x: number; y: number }>;
  randomRotate?: boolean;
}> = ({ joker, onBuy, onSell, onClick, onDrag, active, positionSignal, showPrice = false, randomRotate = false }) => {
  const { hovered, ref } = useHover();
  const description = useValue(joker.description);
  const price = useValue(joker.price);
  const sellPrice = useValue(joker.sellPrice);
  const edition = useValue(joker.edition);
  const image = useValue(joker.image);

  return (
    <PositionedCardContainer
      ref={ref}
      hoverToTop
      effect={joker.emitEffect}
      onClick={() => onClick?.(joker)}
      onDrag={onDrag}
      active={active}
      positionSignal={positionSignal}
      randomRotate={randomRotate}
      info={<>
        {hovered && <Box
          pos="absolute"
          right="calc(2px * var(--mantine-scale) + 100%)"
          top="50%"
          style={{
            transform: 'translateY(-50%)',
            zIndex: 1000,
          }}
        >
          <CardInfoContainer>
            <Box fz={8} fw="bold">{joker.name}</Box>
            <Box fz={6} fw="bold">
              {description}
            </Box>
          </CardInfoContainer>
        </Box>}
        
        {hovered && onSell && <SellButton price={sellPrice} onSell={() => onSell?.(joker)} />}
      </>}
    >
      <Box pos="absolute" left={0} top={0} style={{ zIndex: 1000 }}>
        <Stack gap={0} h={70} w={58} justify="space-between" align="center"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: '144px auto',
            backgroundPosition: 'center bottom',
            backgroundRepeat: 'no-repeat',
            borderTopLeftRadius: 6,
            borderTopRightRadius: 6,
          }}
        >
          <Box fz={6} fw="bold" ta="center" c="orange.9" pos="relative" top={-1} style={{ textShadow: ' 1px 1px 0 #fff, -1px 1px 0 #fff, -1px -1px 0 #fff, 1px -1px 0 #fff' }}>{joker.name}</Box>
        </Stack>
      </Box>
      {edition !== Editions.None && <EditionLabel edition={edition} />}
      <JokerCategoryLabel category={joker.category} />
      {hovered && onBuy && <BuyCardButton onBuy={() => onBuy?.(joker)} />}
      {showPrice && <PriceLabel price={price} />}
    </PositionedCardContainer>
  );
}

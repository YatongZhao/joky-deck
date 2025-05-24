import { useTheme, pokerFont } from "../theme";
import { BoxProps, Group, Stack, StackProps } from "@mantine/core";

import pokerJ from '../images/poker_J.png';
import pokerQ from '../images/poker_Q.png';
import pokerK from '../images/poker_K.png';
import { Box } from "@mantine/core";
import { CardLabels, Suits } from "@yatongzhao/joky-deck-core";

const SuitBox = ({ suit, ...props }: { suit: Suits } & BoxProps) => {
  return <Box
    className={pokerFont.className}
    fz={15}
    {...props}
  >{suit}</Box>;
};

const PlayingCardValue = ({ label, suit, ...props }: { label: CardLabels, suit: Suits } & StackProps) => {
  return <Stack gap={2.5} align="center" lh={0.75} fz={10} {...props}>
    <Box fw={500} fz={11}>{label}</Box>
    <SuitBox suit={suit} fz={10} />
  </Stack>
}

const PlayingCardFaceA = ({ suit, ...props }: { suit: Suits } & BoxProps) => {
  return <Box {...props}>
    <SuitBox suit={suit} fz={16} />
  </Box>
}

const PlayingCardFace2 = ({ suit, ...props }: { suit: Suits } & StackProps) => {
  return <Stack gap={10} {...props}>
    <SuitBox suit={suit} />
    <SuitBox suit={suit} style={{ transform: 'rotate(180deg)' }} />
  </Stack>
}

const PlayingCardFace3 = ({ suit, ...props }: { suit: Suits } & BoxProps) => {
  return <Box {...props}>
    <SuitBox suit={suit} />
    <SuitBox suit={suit} />
    <SuitBox suit={suit} style={{ transform: 'rotate(180deg)' }} />
  </Box>
}

const PlayingCardFace4 = ({ suit, ...props }: { suit: Suits } & StackProps) => {
  return <Stack gap={10} {...props}>
    <Group gap={3} wrap="nowrap">
      <SuitBox suit={suit} />
      <SuitBox suit={suit} />
    </Group>
    <Group gap={3} wrap="nowrap">
      <SuitBox suit={suit} style={{ transform: 'rotate(180deg)' }} />
      <SuitBox suit={suit} style={{ transform: 'rotate(180deg)' }} />
    </Group>
  </Stack>
}

const PlayingCardFace5 = ({ suit, ...props }: { suit: Suits } & StackProps) => {
  return <Stack gap={0} align="center" {...props}>
    <Group gap={3} wrap="nowrap">
      <SuitBox suit={suit} />
      <SuitBox suit={suit} />
    </Group>
    <SuitBox suit={suit} />
    <Group gap={3} wrap="nowrap">
      <SuitBox suit={suit} style={{ transform: 'rotate(180deg)' }} />
      <SuitBox suit={suit} style={{ transform: 'rotate(180deg)' }} />
    </Group>
  </Stack>
}

const PlayingCardFace6 = ({ suit, ...props }: { suit: Suits } & StackProps) => {
  return <Stack gap={0} align="center" {...props}>
    <Group gap={3} wrap="nowrap">
      <SuitBox suit={suit} />
      <SuitBox suit={suit} />
    </Group>
    <Group gap={3} wrap="nowrap">
      <SuitBox suit={suit} />
      <SuitBox suit={suit} />
    </Group>
    <Group gap={3} wrap="nowrap">
      <SuitBox suit={suit} style={{ transform: 'rotate(180deg)' }} />
      <SuitBox suit={suit} style={{ transform: 'rotate(180deg)' }} />
    </Group>
  </Stack>
}

const PlayingCardFace7 = ({ suit, ...props }: { suit: Suits } & StackProps) => {
  return <Stack gap={0} align="center" {...props}>
  <Stack
    pos="absolute"
    left="50%"
    top="16%"
    gap={0}
    style={{
      transform: 'translateX(-50%)'
    }}
  >
    <SuitBox suit={suit} />
  </Stack>
    <Group gap={3} wrap="nowrap">
      <SuitBox suit={suit} />
      <SuitBox suit={suit} />
    </Group>
    <Group gap={3} wrap="nowrap">
      <SuitBox suit={suit} />
      <SuitBox suit={suit} />
    </Group>
    <Group gap={3} wrap="nowrap">
      <SuitBox suit={suit} style={{ transform: 'rotate(180deg)' }} />
      <SuitBox suit={suit} style={{ transform: 'rotate(180deg)' }} />
    </Group>
  </Stack>
}

const PlayingCardFace8 = ({ suit, ...props }: { suit: Suits } & StackProps) => {
  return <Stack gap={0} align="center" {...props}>
    <Stack
      pos="absolute"
      left="50%"
      top="16%"
      gap={0}
      style={{
        transform: 'translateX(-50%)'
      }}
    >
      <SuitBox suit={suit} />
      <SuitBox suit={suit} style={{ transform: 'rotate(180deg)' }} />
    </Stack>
    <Group gap={3} wrap="nowrap">
      <SuitBox suit={suit} />
      <SuitBox suit={suit} />
    </Group>
    <Group gap={3} wrap="nowrap">
      <SuitBox suit={suit} />
      <SuitBox suit={suit} />
    </Group>
    <Group gap={3} wrap="nowrap">
      <SuitBox suit={suit} style={{ transform: 'rotate(180deg)' }} />
      <SuitBox suit={suit} style={{ transform: 'rotate(180deg)' }}/>
    </Group>
  </Stack>
}

const PlayingCardFace9 = ({ suit, ...props }: { suit: Suits } & StackProps) => {
  return <Stack gap={0} align="center" {...props}>
    <Stack
      pos="absolute"
      left="50%"
      top="31%"
      gap={0}
      style={{
        transform: 'translateX(-50%)'
      }}
    >
      <SuitBox suit={suit} />
    </Stack>
    <Group gap={3} wrap="nowrap">
      <SuitBox lh={1.06} suit={suit} />
      <SuitBox lh={1.06} suit={suit} />
    </Group>
    <Group gap={3} wrap="nowrap">
      <SuitBox lh={1.06} suit={suit} />
      <SuitBox lh={1.06} suit={suit} />
    </Group>
    <Group gap={3} wrap="nowrap">
      <SuitBox lh={1.06} suit={suit} style={{ transform: 'rotate(180deg)' }} />
      <SuitBox lh={1.06} suit={suit} style={{ transform: 'rotate(180deg)' }} />
    </Group>
    <Group gap={3} wrap="nowrap">
      <SuitBox lh={1.06} suit={suit} style={{ transform: 'rotate(180deg)' }} />
      <SuitBox lh={1.06} suit={suit} style={{ transform: 'rotate(180deg)' }} />
    </Group>
  </Stack>
}

const PlayingCardFace10 = ({ suit, ...props }: { suit: Suits } & StackProps) => {
  return <Stack gap={0} align="center" {...props}>
    <Stack
      pos="absolute"
      left="50%"
      top="8%"
      gap={7}
      style={{
        transform: 'translateX(-50%)'
      }}
    >
      <SuitBox suit={suit} />
      <SuitBox suit={suit} style={{ transform: 'rotate(180deg)' }} />
    </Stack>
    <Group gap={3} wrap="nowrap">
      <SuitBox lh={1.06} suit={suit} />
      <SuitBox lh={1.06} suit={suit} />
    </Group>
    <Group gap={3} wrap="nowrap">
      <SuitBox lh={1.06} suit={suit} />
      <SuitBox lh={1.06} suit={suit} />
    </Group>
    <Group gap={3} wrap="nowrap">
      <SuitBox lh={1.06} suit={suit} style={{ transform: 'rotate(180deg)' }} />
      <SuitBox lh={1.06} suit={suit} style={{ transform: 'rotate(180deg)' }} />
    </Group>
    <Group gap={3} wrap="nowrap">
      <SuitBox lh={1.06} suit={suit} style={{ transform: 'rotate(180deg)' }} />
      <SuitBox lh={1.06} suit={suit} style={{ transform: 'rotate(180deg)' }} />
    </Group>
  </Stack>
}

const PlayingCardFaceJ = ({ style, ...props }: BoxProps) => {
  const theme = useTheme();

  return <Box w={35} h={60} style={{
    backgroundImage: `url(${pokerJ.src})`,
    backgroundSize: '86px auto',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    border: `0.5px solid ${theme.colors.gameMain?.[2]}`,
    borderRadius: 4,
    ...(style || {}),
  }} {...props} />
}

const PlayingCardFaceQ = ({ style, ...props }: BoxProps) => {
  const theme = useTheme();

  return <Box w={35} h={60} style={{
    backgroundImage: `url(${pokerQ.src})`,
    backgroundSize: '86px auto',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    border: `0.5px solid ${theme.colors.gameMain?.[2]}`,
    borderRadius: 4,
    ...(style || {}),
  }} {...props} />
}

const PlayingCardFaceK = ({ style, ...props }: BoxProps) => {
  const theme = useTheme();

  return <Box w={35} h={65} style={{
    backgroundImage: `url(${pokerK.src})`,
    backgroundSize: '86px auto',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    border: `0.5px solid ${theme.colors.gameMain?.[1]}`,
    borderRadius: 4,
    ...(style || {}),
  }} {...props} />
}

export const PlayingCard = ({ label, suit }: { label: CardLabels, suit: Suits }) => {
  const theme = useTheme();
  return <Box c={(suit === Suits.heart || suit === Suits.diamond) ? theme.colors.red[7] : theme.colors.dark[7]}>
    <PlayingCardValue label={label} suit={suit} pos="absolute" style={{ zIndex: 1000 }} top={1} left={1} />
    <PlayingCardValue style={{ transform: 'rotate(180deg)', zIndex: 1000 }} label={label} suit={suit} pos="absolute" bottom={1} right={1} />
    {label === CardLabels.A && <PlayingCardFaceA suit={suit} pos="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} />}
    {label === CardLabels.n2 && <PlayingCardFace2 suit={suit} pos="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} />}
    {label === CardLabels.n3 && <PlayingCardFace3 suit={suit} pos="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} />}
    {label === CardLabels.n4 && <PlayingCardFace4 suit={suit} pos="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} />}
    {label === CardLabels.n5 && <PlayingCardFace5 suit={suit} pos="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} />}
    {label === CardLabels.n6 && <PlayingCardFace6 suit={suit} pos="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} />}
    {label === CardLabels.n7 && <PlayingCardFace7 suit={suit} pos="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} />}
    {label === CardLabels.n8 && <PlayingCardFace8 suit={suit} pos="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} />}
    {label === CardLabels.n9 && <PlayingCardFace9 suit={suit} pos="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} />}
    {label === CardLabels.n10 && <PlayingCardFace10 suit={suit} pos="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} />}
    {label === CardLabels.J && <PlayingCardFaceJ pos="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} />}
    {label === CardLabels.Q && <PlayingCardFaceQ pos="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} />}
    {label === CardLabels.K && <PlayingCardFaceK pos="absolute" top="50%" left="50%" style={{ transform: 'translate(-50%, -50%)' }} />}
  </Box>
}

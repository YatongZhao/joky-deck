import { Box, Divider, Flex, Text } from "@mantine/core"
import { useGame } from "../GameContext";
import { useValue } from "../hooks/useValue";
import { valueTypeNames } from "@yatongzhao/joky-deck-core";

export const HandScoreDashboard = () => {
  const game = useGame();
  const round = useValue(game.round);
  
  const selectedHandValue = useValue(round.selectedHandValue);
  const selectedScoreFactorLevel = useValue(round.selectedScoreFactorLevel);
  const chips = useValue(round.handChipsFactor);
  const multi = useValue(round.handMultiFactor);

  return <Box 
    fz={10} fw={900} w={300}
    p={2}
    style={{
      overflow: 'hidden',
      border: '1px solid gray',
      borderLeft: 'none',
      borderRight: 'none',
      borderTop: 'none',
    }}
  >
    <Flex h="100%" align="center" justify="center" opacity={selectedHandValue ? 1 : 0}>
      <Text fw={100} ff="monospace" lh={1} fz={8}>{selectedHandValue ? valueTypeNames[selectedHandValue?.type] : ''}</Text>
      <Divider orientation="vertical" mx={4} />
      <Text fw={100} ff="monospace" lh={1} fz={8}>lvl.{selectedScoreFactorLevel === null ? '0' : selectedScoreFactorLevel + 1}</Text>
      <Divider orientation="vertical" mx={4} />
      <Text style={{ height: '100%' }} fw={900} ff="monospace" lh={1} fz={8}>{chips}✖{multi}</Text>
    </Flex>
  </Box>
}

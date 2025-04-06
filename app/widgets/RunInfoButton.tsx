import { Box, Modal, Text, Stack, Group, MantineStyleProps } from "@mantine/core";
import React from "react";
import { PanelButton } from "../components/PanelButton";
import { useDisclosure } from "@mantine/hooks";
import { useGame } from "../GameContext";
import { useValue } from "../hooks/useValue";
import { ValueType, ScoreFactorMap, valueTypeNames } from "@yatongzhao/joky-deck-core";
import { useTheme } from "../theme";

export const RunInfoButton: React.FC<{ h?: MantineStyleProps['h']; onClick?: () => void }> = ({ h, onClick }) => {
  return <PanelButton
    h={h}
    buttonColor="red.5"
    onClick={onClick}
  >
    <Box>Run</Box>
    <Box fz={14}>Info</Box>
  </PanelButton>
}

export const SideRunInfoButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  const theme = useTheme();
  return <PanelButton
    buttonColor={theme.colors.gameMain[5]}
    onClick={onClick}
  >
    <Box mt={2} fw={900}>Run</Box>
    <Box fz={14} mb={5} fw={900}>Info</Box>
  </PanelButton>
}

export const RunInfo: React.FC<{ Button: React.FC<{ onClick?: () => void }> }> = ({ Button }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const game = useGame();
  const scoreFactorLevelMap = useValue(game.scoreFactorLevelMap);
  const scoreFactorPlayedTimesMap = useValue(game.scoreFactorPlayedTimesMap);
  return (
    <>
      {<Button onClick={open} />}
      <Modal opened={opened} onClose={close} title="Run Info" size="lg">
        <Stack gap={4}>
          {Object.entries(scoreFactorLevelMap).map(([type, level]) => {
            const valueType = type as ValueType;
            const scoreFactor = ScoreFactorMap[valueType](level);
            return (
              <Box 
                key={type} 
                px={10} 
                py={4}
                style={{ 
                  border: '1px solid #eee',
                  borderRadius: '4px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <Group justify="space-between" align="center">
                  <Box>
                    <Group gap="xs">
                      <Text fw={500}>lvl.{level + 1}</Text>
                      <Text>{valueTypeNames[valueType]}</Text>
                    </Group>
                  </Box>
                  <Group gap="lg">
                    <Text c="blue" fw={500}>{scoreFactor.chips} chips</Text>
                    <Text c="red" fw={500}>×{scoreFactor.multi}</Text>
                    <Text c="red" fw={500}>{scoreFactorPlayedTimesMap[valueType]}</Text>
                  </Group>
                </Group>
              </Box>
            );
          })}
        </Stack>
      </Modal>
    </>
  );
}

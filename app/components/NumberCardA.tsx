import { DefaultMantineColor, rgba, Stack, StyleProp, Text } from "@mantine/core";
import { useTheme } from "../theme";

export const NumberCardA: React.FC<{
  label: string;
  value: number;
  unit?: string;
  c?: StyleProp<DefaultMantineColor>;
}> = ({ label, value, unit, c }) => {
  const theme = useTheme();

  return (
    <Stack
      bg={c || rgba(theme.colors.gameMain[4], 0.8)}
      style={{ borderRadius: 5 }}
      align="center"
      pos="relative"
      fw={900}
      gap={0}
      pb={2}
      px={3}
    >
      <Text pos="absolute" top={0} left={2} fw={900} fz={10} c="white">{label}</Text>
      <Text pos="relative" top={-1} left={7} fw={900} lh={.7} fz={48} c="white">{value}</Text>
      {unit && <Text ff="monospace" fw={900} pos="absolute" bottom={0} right={1} fz={12} c="white">{unit}</Text>}
    </Stack>
  )
}

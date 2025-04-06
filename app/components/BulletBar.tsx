import { Group, MantineColor, parseThemeColor } from "@mantine/core";
import { animated, useSprings } from "@react-spring/web";
import { useEffect } from "react";
import { useTheme } from "../theme";

export const BulletBar: React.FC<{
  max: number;
  current: number;
  direction?: 'ltr' | 'rtl';
  color?: MantineColor;
}> = ({ max, current, direction = 'ltr', color = 'blue.5' }) => {
  const theme = useTheme();
  const parsedColor = parseThemeColor({ theme, color });
  const [bulletSprings, bulletApi] = useSprings(
    max,
    () => ({
      opacity: 1,
      scale: 1,
    }),
  );

  useEffect(() => {
    bulletApi.start((i) => ({
      opacity: (direction === 'ltr' ? max - current > i : current <= i) ? 0 : 1,
      scale: (direction === 'ltr' ? max - current > i : current <= i) ? 2 : 1,
    }));
  }, [current, bulletApi, max, direction]);

  return <Group gap={2}>
    {bulletSprings.map((spring, i) => (
      <animated.div key={i} style={{
        backgroundColor: parsedColor.value,
        width: 3 * theme.scale,
        height: 15 * theme.scale,
        borderRadius: 3 * theme.scale,
        transform: spring.scale.to(scale => `scale(${scale})`),
        opacity: spring.opacity,
      }} />
    ))}
  </Group>;
};

import { MantineStyleProps, Stack } from "@mantine/core"
import { ReactNode } from "react";

export const CardInfoContainer: React.FC<{
  children: ReactNode;
  w?: MantineStyleProps['w'];
}> = ({ children, w }) => {
  return <Stack
    w={w || 50}
    align="center"
    py={2}
    px={5}
    gap={2}
    style={{
      border: 'calc(2px * var(--mantine-scale)) solid black',
      borderRadius: `calc(5px * var(--mantine-scale))`,
      backgroundColor: 'white',
    }}
  >
    {children}
  </Stack>;
}

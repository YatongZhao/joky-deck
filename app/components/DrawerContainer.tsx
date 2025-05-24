import { Flex } from "@mantine/core"
import { useTheme } from "../theme";
import { ReactNode } from "react";

export const DrawerContainer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const theme = useTheme();

  return (
    <Flex
      pos="absolute"
      w={425}
      h={346}
      justify="center"
      align="flex-start"
      p={3}
      fw="bold"
      bg={theme.colors.gameMain?.[9]}
      style={{ borderTopLeftRadius: 15, borderTopRightRadius: 15 }}
    >
      {children}
    </Flex>
  )
}

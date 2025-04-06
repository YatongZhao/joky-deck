import { Box, Button } from "@mantine/core"

export const HomeScene: React.FC<{ onStart?: () => void }> = ({ onStart }) => {
  return <Box>
    <Button onClick={onStart}>开始游戏</Button>
  </Box>
}

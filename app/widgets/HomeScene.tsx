import { Box, Button } from "@mantine/core"

export const HomeScene: React.FC<{ onStart?: () => void }> = ({ onStart }) => {
  return <Box>
    <Button onClick={onStart}>Start Game</Button>
  </Box>
}

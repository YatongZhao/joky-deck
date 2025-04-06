import { Flex, Grid, Stack } from "@mantine/core"
import { AnteInfoCard } from "./AnteInfoCard"
import { HandScoreCard } from "./HandScoreCard"
import { MoneyCard } from "./MoneyCard"
import { RoundScoreCard } from "./RoundScoreCard"

export const ControlPad = () => {
  return <Flex direction="column" gap={3} h={444}>
    <AnteInfoCard />
    <RoundScoreCard />
    <HandScoreCard />
    <Grid gutter={3}>
      <Grid.Col span={12}>
        <Stack gap={3}>
          <MoneyCard />
        </Stack>
      </Grid.Col>
    </Grid>
  </Flex>
}

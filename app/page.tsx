"use client"
import { MantineProvider } from "@mantine/core";
import { GameScene } from "./widgets/GameScene";
import { theme } from "./theme";

export default function Home() {
  return (
    <MantineProvider theme={theme}>
      <GameScene />
    </MantineProvider>
  );
}

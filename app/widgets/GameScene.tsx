'use client'
import { useState } from "react"
import { GameContext } from "../GameContext"
import { Config, Game } from "@yatongzhao/joky-deck-core"
import { StrategyScene } from "./StrategyScene";
import { HomeScene } from "./HomeScene";
import { Flex } from "@mantine/core";

export const GameScene = () => {
  const [state, setState] = useState(0);
  const [game, setGame] = useState<Game | null>(null);

  const handleStart = (config: Config) => {
    setGame(new Game(config));
    setState(1);
  }

  const handleGameOver = () => {
    setState(0);
  }

  return <Flex align="center" justify="center">
    {state === 0 && <HomeScene onStart={handleStart} />}
    {state === 1 && (game ? (
      <GameContext.Provider value={game}>
        <StrategyScene onGameOver={handleGameOver} />
      </GameContext.Provider>
    ) : (
      <div>Loading...</div>
    ))}
  </Flex>
}

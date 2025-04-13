import { useState } from "react"
import { GameContext } from "../GameContext"
import { Game, assets } from "@yatongzhao/joky-deck-core"
import { StrategyScene } from "./StrategyScene";
import { HomeScene } from "./HomeScene";
import { Flex } from "@mantine/core";

console.log(assets);

export const GameScene = () => {
  const [state, setState] = useState(0);
  const [game, setGame] = useState(new Game());

  const handleStart = () => {
    setGame(new Game());
    setState(1);
  }

  const handleGameOver = () => {
    setState(0);
  }

  return <Flex align="center" justify="center">
    <GameContext.Provider value={game}>
      {state === 0 && <HomeScene onStart={handleStart} />}
      {state === 1 && <StrategyScene onGameOver={handleGameOver} />}
    </GameContext.Provider>
  </Flex>
}

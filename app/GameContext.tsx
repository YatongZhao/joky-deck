import { createContext, useContext } from "react";
import { Game } from "@yatongzhao/joky-deck-core";

export const GameContext = createContext<Game | null>(null);
export const useGame = () => useContext(GameContext) as Game;

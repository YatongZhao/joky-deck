import { createContext, useContext } from "react";
import { Game } from "@yatongzhao/joky-deck-core";

export const GameContext = createContext(new Game());
export const useGame = () => useContext(GameContext);

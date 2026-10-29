import { createContext, useContext } from "react";
import { PlayerStore } from "./store";
import { PlayerActions } from "./types";

export const PlayerContext = createContext<PlayerStore | null>(null);
export const PlayerActionsContext = createContext<PlayerActions | null>(null);

export const usePlayerStore = (): PlayerStore => {
  const store = useContext(PlayerContext);
  if (!store) {
    throw new Error("Player hooks must be used within a <Player /> component.");
  }
  return store;
};

export const usePlayerActions = (): PlayerActions => {
  const actions = useContext(PlayerActionsContext);
  if (!actions)
    throw new Error("Player hooks must be used within a <Player /> component.");
  return actions;
};

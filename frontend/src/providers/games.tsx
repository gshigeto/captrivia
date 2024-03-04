import { PropsWithChildren, createContext, useContext, useState } from "react";
import { GameSession } from "../models";
import {
  deleteLocalStorageGame,
  getLocalStorageCurrentGame,
  getLocalStorageGames,
  setLocalStorageCurrentGame,
  updateLocalStorageGames,
} from "../utils/localStorage";

export const GamesContext = createContext<{
  games: GameSession[];
  currentGame: GameSession | null;
  startGame: (game: GameSession) => void;
  finishGame: () => void;
  loadGame: (gameId: string) => void;
  deleteGame: (gameId: string) => void;
}>({
  games: [],
  currentGame: null,
  startGame: (game: GameSession) => {
    throw new Error("Method not implemented");
  },
  finishGame: () => {
    throw new Error("Method not implemented");
  },
  loadGame: (gameId: string) => {
    throw new Error("Method not implemented");
  },
  deleteGame: (gameId: string) => {
    throw new Error("Method not implemented");
  },
});

export const GamesProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [games, setGames] = useState<GameSession[]>(getLocalStorageGames());
  const [currentGame, setCurrentGame] = useState<GameSession | null>(
    getLocalStorageCurrentGame()
  );

  const startGame = (game: GameSession) => {
    const newGames = updateLocalStorageGames(game);
    setLocalStorageCurrentGame(game);

    setGames(newGames);
    setCurrentGame(game);
  };

  const finishGame = () => {
    setCurrentGame(null);
  };

  const loadGame = (gameId: string) => {
    const game = games.find((game) => game.gameId === gameId);
    if (game) {
      setLocalStorageCurrentGame(game);
      setCurrentGame(game);
    }
    return Promise.resolve();
  };

  const deleteGame = (gameId: string) => {
    const newGames = deleteLocalStorageGame(gameId);
    setGames(newGames);
  };

  return (
    <GamesContext.Provider
      value={{
        games,
        currentGame,
        startGame,
        finishGame,
        loadGame,
        deleteGame,
      }}
    >
      {children}
    </GamesContext.Provider>
  );
};

export const useGames = () => {
  return useContext(GamesContext);
};

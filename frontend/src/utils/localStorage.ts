import { GameSession } from "../models";

/**
 * Get the games from local storage
 * @returns {GameSession[]}
 * @example
 * const games = getLocalStorageGames();
 * console.log(games);
 */
export const getLocalStorageGames = (): GameSession[] => {
  const games = localStorage.getItem("games");
  try {
    const parsedGames = JSON.parse(games!) || [];
    return parsedGames;
  } catch (error) {
    return [];
  }
};

/**
 * Update the games in local storage
 * @param {GameSession} game - Game to add in local storage
 * @returns {GameSession[]} - Updated games
 * @example
 * const games = updateLocalStorageGames(game);
 * console.log(games);
 */
export const updateLocalStorageGames = (game: GameSession): GameSession[] => {
  const games = getLocalStorageGames();
  games.push(game);
  localStorage.setItem("games", JSON.stringify(games));
  return games;
};

/**
 * Check if gameId exists in local storage games and return that game object
 * @param {string} gameId - Id of the game to check
 * @returns {GameSession | null} - Game object if gameId exists, null otherwise
 * @example
 * const game = getLocalStorageGameById("123");
 * console.log(game);
 */
export const getLocalStorageGameById = (gameId: string): GameSession | null => {
  const games = getLocalStorageGames();
  const game = games.find((game) => game.gameId === gameId);
  return game || null;
};

/**
 * Delete the game from local storage
 * @param {string} gameId - Id of the game to delete
 * @returns {GameSession[]} - Updated games
 * @example
 * const games = deleteLocalStorageGame("123");
 * console.log(games);
 */
export const deleteLocalStorageGame = (gameId: string): GameSession[] => {
  const games = getLocalStorageGames();
  const newGames = games.filter((game) => game.gameId !== gameId);
  localStorage.setItem("games", JSON.stringify(newGames));

  // Check to see if currentGame is the one being deleted
  const currentGame = getLocalStorageCurrentGame();
  if (currentGame?.gameId === gameId) {
    localStorage.removeItem("currentGame");
  }

  return newGames;
};

/**
 * Get the current game from local storage
 * @returns {GameSession | null}
 * @example
 * const game = getLocalStorageCurrentGame();
 * console.log(game);
 */
export const getLocalStorageCurrentGame = (): GameSession | null => {
  const game = localStorage.getItem("currentGame");
  try {
    const parsedGame = JSON.parse(game!);
    return parsedGame;
  } catch (error) {
    return null;
  }
};

/**
 * Set the current game in local storage
 * @param {GameSession} game - Game to set in local storage
 * @example
 * setLocalStorageCurrentGame(game);
 * console.log("Game set in local storage");
 */
export const setLocalStorageCurrentGame = (game: GameSession): void => {
  localStorage.setItem("currentGame", JSON.stringify(game));
};

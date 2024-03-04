import { AnswerResponse, Game, GameSession, Question } from "../models";

// Use REACT_APP_BACKEND_URL or http://localhost:8080 as the API_BASE
const API_BASE =
  import.meta.env.REACT_APP_BACKEND_URL || "http://localhost:8080";

/**
 * Wrapper around fetch to handle errors and parsing JSON
 * @param url
 * @param options
 * @returns
 */
const fetchWrapper = async <T>(
  url: string,
  options?: RequestInit
): Promise<T> => {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to fetch.");
    }
    return data as T;
  } catch (error) {
    throw error;
  }
};

interface NewGameRequest {
  name: string;
  multiplayer: boolean;
}
/**
 * Start a new game with the given name and multiplayer option
 * @param name - Name of the player
 * @param multiplayer - Whether the game is multiplayer or not
 * @returns - NewGameResponse with gameId and sessionId
 * @throws - Error if failed to start game
 * @example
 * const { gameId, sessionId } = await startGame({ name: "John", multiplayer: true });
 * console.log(gameId, sessionId);
 */
export const startGame = async ({
  name,
  multiplayer,
}: NewGameRequest): Promise<GameSession> => {
  try {
    return await fetchWrapper<GameSession>(`${API_BASE}/game/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, multiplayer }),
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch game details for the given gameId
 * @param gameId - Id of the game
 * @param sessionId - Id of the session
 * @returns - GameSession object
 * @throws - Error if failed to fetch game
 * @example
 * const game = await fetchGame("123");
 * console.log(game);
 */
export const fetchGame = async (
  gameId: string,
  sessionId: string
): Promise<Game> => {
  try {
    return await fetchWrapper<Game>(`${API_BASE}/game/${gameId}/${sessionId}`);
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch questions for the given gameId
 * @param gameId - Id of the game
 * @returns - Array of questions
 * @throws - Error if failed to fetch questions
 * @example
 * const questions = await fetchQuestions("123");
 * console.log(questions);
 */
export const fetchQuestions = async (gameId: string): Promise<Question[]> => {
  try {
    return await fetchWrapper<Question[]>(`${API_BASE}/questions/${gameId}`);
  } catch (error) {
    throw error;
  }
};

/**
 * Submit answer for the given question
 * @param gameId - Id of the game
 * @param sessionId - Id of the session
 * @param questionId - Id of the question
 * @param answer - Index of the answer
 * @returns - Object with correct and currentScore
 * @throws - Error if failed to submit answer
 * @example
 * const { correct } = await submitAnswer("123", "456", "789", 2);
 * console.log(correct);
 */
export const submitAnswer = async (
  gameId: string,
  sessionId: string,
  questionId: string,
  answer: number
): Promise<AnswerResponse> => {
  try {
    return await fetchWrapper<AnswerResponse>(`${API_BASE}/answer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameId, sessionId, questionId, answer }),
    });
  } catch (error) {
    throw error;
  }
};

/**
 * End the game with the given gameId and sessionId
 * @param gameId - Id of the game
 * @param sessionId - Id of the session
 * @returns - Object with message
 * @throws - Error if failed to end game
 * @example
 * const data = await endGame("123", "456");
 * console.log(data);
 */
export const endGame = async (gameId: string, sessionId: string) => {
  try {
    return await fetchWrapper(`${API_BASE}/game/end`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gameId, sessionId }),
    });
  } catch (error) {
    throw error;
  }
};

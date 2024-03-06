import { Question } from "./question";

export interface GameSession {
  gameId: string;
  sessionId: string;
}

export interface Game {
  currentScore: number;
  started: boolean;
  finished: boolean;
  id: string;
  multiplayer: boolean;
  questionIndex: number;
  questions: Question[];
  owner?: boolean;
}

export interface AnswerResponse {
  alreadyAnswered: boolean;
  correct: boolean;
  currentScore: number;
  nextQuestionIndex: number;
}

export interface EndGameResponse {
  finalScore: number;
  multiplayer: boolean;
  finished: boolean;

  // This will be sent if multiplayer
  players?: ScoreUpdate[];
}

export interface ScoreUpdate {
  name: string;
  score: number;
  sessionId: string;
}

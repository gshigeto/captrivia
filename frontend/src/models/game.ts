import { Question } from "./question";

export interface GameSession {
  gameId: string;
  sessionId: string;
}

export interface Game {
  currentScore: number;
  finished: boolean;
  id: string;
  multiplayer: boolean;
  questionIndex: number;
  questions: Question[];
}

export interface AnswerResponse {
  correct: boolean;
  currentScore: number;
  nextQuestionIndex: number;
}

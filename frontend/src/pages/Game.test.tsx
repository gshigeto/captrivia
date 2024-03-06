import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Mock } from "vitest";
import * as Api from "../api";
import { AnswerResponse, Game as GameModel } from "../models";
import { useGames } from "../providers/games";
import { SnackBarContext } from "../providers/snackbar";
import Game from "./Game";

vi.mock("../api", () => ({
  fetchGame: vi.fn(),
  submitAnswer: vi.fn(),
}));

const mockCurrentGame = vi.fn();
vi.mock("../providers/games", () => ({
  useGames: vi.fn(),
  currentGame: () => mockCurrentGame,
}));

const gameData: GameModel = {
  currentScore: 0,
  started: true,
  finished: false,
  id: "123",
  multiplayer: false,
  questionIndex: 0,
  questions: [
    {
      id: "q1",
      questionText: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Madrid"],
      correctIndex: 0,
    },
    {
      id: "q2",
      questionText: "What is the capital of Japan?",
      options: ["Paris", "London", "Berlin", "Tokyo"],
      correctIndex: 0,
    },
  ],
};

const answerReponse: AnswerResponse = {
  correct: true,
  alreadyAnswered: false,
  currentScore: 10,
  nextQuestionIndex: 1,
};

const renderGame = () => {
  render(
    <MemoryRouter>
      <SnackBarContext.Provider value={{ setSnackbarMessage: vi.fn() }}>
        <Game />
      </SnackBarContext.Provider>
    </MemoryRouter>
  );
};

describe("Game", () => {
  beforeEach(() => {
    (useGames as Mock).mockReturnValue({
      currentGame: mockCurrentGame,
    });

    vi.clearAllMocks();
  });

  it("renders the game page correctly", async () => {
    mockCurrentGame.mockReturnValue({ gameId: "123", sessionId: "Game 1" });
    vi.spyOn(Api, "fetchGame").mockResolvedValue(gameData);
    renderGame();

    await waitFor(() => {
      expect(
        screen.getByText("What is the capital of France?")
      ).toBeInTheDocument();
    });
  });

  it("renders the game page correctly based on index", async () => {
    mockCurrentGame.mockReturnValue({ gameId: "123", sessionId: "Game 1" });
    vi.spyOn(Api, "fetchGame").mockResolvedValue({
      ...gameData,
      questionIndex: 1,
    });
    renderGame();

    await waitFor(() => {
      expect(
        screen.getByText("What is the capital of Japan?")
      ).toBeInTheDocument();
    });
  });

  it("submits an answer correctly", async () => {
    mockCurrentGame.mockReturnValue({ gameId: "123", sessionId: "Game 1" });
    vi.spyOn(Api, "fetchGame").mockResolvedValue(gameData);
    const submitSpy = vi
      .spyOn(Api, "submitAnswer")
      .mockResolvedValue(answerReponse);

    renderGame();
    await act(async () => {});

    await waitFor(() => {
      expect(
        screen.getByText("What is the capital of France?")
      ).toBeInTheDocument();
    });

    await act(async () => {
      userEvent.click(screen.getByText("Paris"));
    });

    await waitFor(() => {
      expect(submitSpy).toHaveBeenCalledWith("123", "Game 1", "q1", 0);
      expect(
        screen.getByText("What is the capital of Japan?")
      ).toBeInTheDocument();
    });
  });
});

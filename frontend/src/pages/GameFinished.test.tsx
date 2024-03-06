import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Mock } from "vitest";
import * as Api from "../api";
import { GameSession } from "../models";
import { useGames } from "../providers/games";
import GameFinished from "./GameFinished";

vi.mock("../api", () => ({
  joinGame: vi.fn(),
  endGame: vi.fn(),
}));

vi.mock("../utils/socket");

const mockGames: GameSession[] = [
  { gameId: "1", sessionId: "Game 1" },
  { gameId: "2", sessionId: "Game 2" },
];
vi.mock("../providers/games", () => ({
  useGames: vi.fn(),
  startGame: vi.fn(),
  getGame: () => getGameMock,
}));

const getGameMock = vi.fn();
const mockCurrentGame = vi.fn();
describe("GameFinished", () => {
  beforeEach(() => {
    (useGames as Mock).mockReturnValue({
      currentGame: mockCurrentGame,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the game is finished", async () => {
    const endGameSpy = vi.spyOn(Api, "endGame").mockResolvedValue({
      finalScore: 10,
      multiplayer: false,
      finished: true,
    });
    mockCurrentGame.mockReturnValue(mockGames[0]);
    render(
      <MemoryRouter>
        <GameFinished />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(endGameSpy).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Game Finished!")).toBeInTheDocument();
      expect(screen.getByText("Final Score: 10")).toBeInTheDocument();
    });
  });

  it("should render the game is still not finished", async () => {
    const endGameSpy = vi.spyOn(Api, "endGame").mockResolvedValue({
      finalScore: 40,
      multiplayer: true,
      finished: false,
    });
    mockCurrentGame.mockReturnValue(mockGames[0]);
    render(
      <MemoryRouter>
        <GameFinished />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(endGameSpy).toHaveBeenCalledTimes(1);
      expect(
        screen.getByText("Waiting for game to finish...")
      ).toBeInTheDocument();
      expect(screen.getByText("Players scores")).toBeInTheDocument();
    });
  });
});

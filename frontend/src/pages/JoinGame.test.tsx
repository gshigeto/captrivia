import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { Mock } from "vitest";
import { joinGame } from "../api";
import { GameSession } from "../models";
import { useGames } from "../providers/games";
import { SnackBarContext } from "../providers/snackbar";
import JoinGame from "./JoinGame";

vi.mock("../api", () => ({
  joinGame: vi.fn(),
}));

const getGameMock = vi.fn();
vi.mock("../providers/games", () => ({
  useGames: vi.fn(),
  startGame: vi.fn(),
  getGame: () => getGameMock,
}));

const mockGames: GameSession[] = [
  { gameId: "1", sessionId: "Game 1" },
  { gameId: "2", sessionId: "Game 2" },
];

const mockStartGame = vi.fn();
describe("JoinGame", () => {
  beforeEach(() => {
    (useGames as Mock).mockReturnValue({
      games: mockGames,
      loading: false,
      error: null,
      loadGame: vi.fn(),
      startGame: mockStartGame,
      getGame: getGameMock,
    });

    render(
      <MemoryRouter>
        <SnackBarContext.Provider value={{ setSnackbarMessage: vi.fn() }}>
          <JoinGame />
        </SnackBarContext.Provider>
      </MemoryRouter>
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the JoinGame component", async () => {
    const gameInput = await screen.findByTestId("game-input");
    const nameInput = await screen.findByTestId("name-input");

    expect(gameInput).toBeInTheDocument();
    expect(nameInput).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Join Game" })
    ).toBeInTheDocument();
  });

  it("should call joinGame API when Join button is clicked and no current game", async () => {
    const gameInput = await screen.findByTestId("game-input");
    const nameInput = await screen.findByTestId("name-input");
    const joinBUtton = screen.getByRole("button", { name: "Join Game" });
    getGameMock.mockReturnValue(null);

    await act(async () => {
      userEvent.type(gameInput, "ABC123");
      userEvent.type(nameInput, "John Doe");
      userEvent.click(joinBUtton);
    });

    await waitFor(() => {
      expect(joinGame).toHaveBeenCalledWith("ABC123", "John Doe");
    });
  });

  it("should call startGame when Join button is clicked and there is current game", async () => {
    const gameInput = await screen.findByTestId("game-input");
    const nameInput = await screen.findByTestId("name-input");
    const joinBUtton = screen.getByRole("button", { name: "Join Game" });
    getGameMock.mockReturnValue(mockGames[0]);

    await act(async () => {
      userEvent.type(gameInput, "ABC123");
      userEvent.type(nameInput, "John Doe");
      userEvent.click(joinBUtton);
    });

    await waitFor(() => {
      expect(mockStartGame).toHaveBeenCalledWith(mockGames[0], true);
    });
  });
});

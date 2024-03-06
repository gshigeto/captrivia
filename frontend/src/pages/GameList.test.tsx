import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { GameSession } from "../models";
import { useGames } from "../providers/games";
import GameList from "./GameList";

vi.mock("../providers/games", () => ({
  useGames: vi.fn(),
  loadGame: vi.fn(),
}));

const mockedUsedNavigate = vi.fn();
vi.mock("react-router-dom", () => {
  const originalModule = vi.importActual("react-router-dom");
  return {
    ...originalModule,
    MemoryRouter: vi.fn(({ children }) => children),
    useNavigate: () => mockedUsedNavigate,
  };
});

const mockGames: GameSession[] = [
  { gameId: "1", sessionId: "Game 1" },
  { gameId: "2", sessionId: "Game 2" },
];

describe("GameList", () => {
  beforeEach(() => {
    (useGames as jest.Mock).mockReturnValue({
      games: mockGames,
      loading: false,
      error: null,
      loadGame: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the game list correctly", () => {
    render(
      <MemoryRouter>
        <GameList />
      </MemoryRouter>
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("navigates to the selected game on button click", () => {
    render(
      <MemoryRouter>
        <GameList />
      </MemoryRouter>
    );

    userEvent.click(screen.getByText("1"));
    expect(mockedUsedNavigate).toHaveBeenCalledWith("/game/play");
  });
});

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { startGame as startGameApi } from "../api";
import { SnackBarContext } from "../providers/snackbar";
import Home from "./Home";

vi.mock("../api", () => ({
  startGame: vi.fn(),
}));

const mockedUsedNavigate = vi.fn();
vi.mock("react-router-dom", () => {
  const originalModule = vi.importActual("react-router-dom");
  return {
    ...originalModule,
    MemoryRouter: vi.fn(({ children }) => children),
    useNavigate: vi.fn(() => mockedUsedNavigate),
  };
});

describe("Home", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <SnackBarContext.Provider value={{ setSnackbarMessage: vi.fn() }}>
          <Home />
        </SnackBarContext.Provider>
      </MemoryRouter>
    );
  });

  it("renders the Home component", () => {
    expect(screen.getByText("Welcome to Captrivia!")).toBeInTheDocument();
  });

  it("renders the start game button", () => {
    expect(
      screen.getByRole("button", { name: "Start Game" })
    ).toBeInTheDocument();
  });

  it("should show errors when the name is empty", async () => {
    userEvent.click(screen.getByRole("button", { name: "Start Game" }));
    expect(screen.getAllByText("Name cannot be empty")).toHaveLength(1);
  });

  it("navigates to the game page when start game button is clicked", async () => {
    const input = await screen.findByTestId("name-input");

    await act(async () => {
      userEvent.type(input, "Jay");
      userEvent.click(screen.getByRole("button", { name: "Start Game" }));
    });

    await waitFor(() => {
      expect(startGameApi).toHaveBeenCalledWith({
        name: "Jay",
        multiplayer: false,
        questions: 10,
      });
    });
  });
});

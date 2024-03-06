import { LoadingButton } from "@mui/lab";
import { Card, Container, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { joinGame } from "../api";
import { FancyDefaultTitle } from "../components/FancyTitle";
import { useGames } from "../providers/games";
import { useSnackBar } from "../providers/snackbar";

const JoinGame = () => {
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(false);

  const [gameIdError, setGameIdError] = useState<string | null>(null);
  const [playerNameError, setPlayerNameError] = useState<string | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const { startGame, getGame } = useGames();
  const navigate = useNavigate();
  const { setSnackbarMessage } = useSnackBar();

  useEffect(() => {
    const gameId = searchParams.get("gameId");
    if (gameId) {
      setGameId(gameId);

      const currentGame = getGame(gameId);
      if (currentGame) {
        startGame(currentGame, true);
        navigate("/game/play");
        return;
      }
    }
  }, [searchParams]);

  const joinGameHandler = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);

    if (gameId === "" || playerName === "") {
      if (gameId === "") setGameIdError("Game ID cannot be empty");
      if (playerName === "") setPlayerNameError("Player Name cannot be empty");
      setLoading(false);
      return;
    }

    try {
      // Check to see if game session already exists for game
      const currentGame = getGame(gameId);
      if (currentGame) {
        startGame(currentGame, true);
        navigate("/game/play");
        return;
      }

      // Join the game
      const game = await joinGame(gameId, playerName);
      startGame(game);
      navigate("/game/play");
    } catch (error) {
      if (error instanceof Error) {
        setSnackbarMessage(error.message);
      }
      setSearchParams({});
    }
    setLoading(false);
  };

  return (
    <>
      <Container maxWidth="xs" sx={{ mt: 4 }}>
        <FancyDefaultTitle
          variant="h4"
          gutterBottom
          className="title"
          sx={{ pt: 4 }}
        >
          Join Captrivia Game!
        </FancyDefaultTitle>

        <Card sx={{ p: 2 }}>
          <form noValidate autoComplete="off">
            <TextField
              id="standard-basic"
              fullWidth
              label="Enter Game ID"
              variant="standard"
              required
              value={gameId}
              error={gameIdError !== null}
              helperText={gameIdError}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const gameId = event.target.value;
                setGameId(gameId);

                if (gameId === "") {
                  return setGameIdError("Game ID cannot be empty");
                }
                setGameIdError(null);
              }}
            />
            <TextField
              sx={{ mt: 2 }}
              id="standard-basic"
              fullWidth
              label="Enter Your Name"
              variant="standard"
              required
              value={playerName}
              error={playerNameError !== null}
              helperText={playerNameError}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const newName = event.target.value;
                setPlayerName(newName);

                if (newName === "") {
                  return setPlayerNameError("Player Name cannot be empty");
                }
                setPlayerNameError(null);
              }}
            />

            <LoadingButton
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              type="submit"
              onClick={joinGameHandler}
              loading={loading}
            >
              Join Game
            </LoadingButton>
          </form>
        </Card>
      </Container>
    </>
  );
};
export default JoinGame;

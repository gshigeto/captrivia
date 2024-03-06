import { LoadingButton } from "@mui/lab";
import { Card, Container, TextField } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { startGame as startGameApi } from "../api";
import { FancyDefaultTitle } from "../components/FancyTitle";
import { useGames } from "../providers/games";
import { useSnackBar } from "../providers/snackbar";

const Home = () => {
  const [name, setName] = useState("");
  const [questions, setQuestions] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"single" | "multi" | null>(null);

  const { startGame } = useGames();
  const navigate = useNavigate();
  const { setSnackbarMessage } = useSnackBar();

  const startGameHandler = async (
    ev: React.MouseEvent<HTMLButtonElement>,
    multiplayer = false
  ) => {
    ev.preventDefault();
    if (loading) return;

    if (name === "") {
      return setError("Name cannot be empty");
    }
    setError(null);

    setLoading(multiplayer ? "multi" : "single");
    try {
      const gameSession = await startGameApi({ name, multiplayer, questions });

      startGame(gameSession);
      navigate("/game/play");
    } catch (error) {
      setSnackbarMessage("Failed to start game.");
    }

    setLoading(null);
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
          Welcome to Captrivia!
        </FancyDefaultTitle>

        <Card sx={{ p: 2 }}>
          <form noValidate autoComplete="off">
            <TextField
              id="standard-basic"
              fullWidth
              label="Enter Your Name"
              variant="standard"
              required
              value={name}
              error={error !== null}
              helperText={error}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const newName = event.target.value;
                setName(newName);

                if (newName === "") {
                  return setError("Name cannot be empty");
                }
                setError(null);
              }}
            />

            <TextField
              sx={{ mt: 2 }}
              id="standard-basic"
              fullWidth
              label="Enter Number of Questions (Max 20)"
              variant="standard"
              type="number"
              required
              value={questions}
              error={error !== null}
              helperText={error}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const numberOfQuestions = Number(event.target.value);
                if (numberOfQuestions < 1) {
                  return setQuestions(1);
                }
                if (numberOfQuestions > 20) {
                  return setQuestions(20);
                }

                setQuestions(numberOfQuestions);
              }}
            />

            <LoadingButton
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              type="submit"
              onClick={startGameHandler}
              loading={loading === "single"}
            >
              Start Game
            </LoadingButton>
            <LoadingButton
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
              type="button"
              onClick={(ev) => startGameHandler(ev, true)}
              color="secondary"
              loading={loading === "multi"}
            >
              Start Multiplayer Game
            </LoadingButton>
          </form>
        </Card>
      </Container>
    </>
  );
};
export default Home;

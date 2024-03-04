import { Container } from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { endGame } from "../api";
import { FancyDefaultTitle } from "../components/FancyTitle";
import { GameSession } from "../models";
import { useGames } from "../providers/games";

const GameFinished = () => {
  const { currentGame } = useGames();
  const navigate = useNavigate();

  const [currentGameState, setCurrentGameState] = useState<GameSession | null>(
    null
  );
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [gameFinishDetails, setGameFinishDetails] = useState<any>(null);

  const endGameHandler = async () => {
    try {
      const data = await endGame(
        currentGameState?.gameId!,
        currentGameState?.sessionId!
      );
      setGameFinishDetails(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!currentGame) {
      navigate("/");
    }

    if (currentGame && currentGame !== currentGameState) {
      setCurrentGameState(currentGame);
    }
  }, [currentGame]);

  useEffect(() => {
    const fetchData = async () => {
      await endGameHandler();
    };

    if (currentGameState) {
      fetchData();
    }
  }, [currentGameState]);

  if (loading) {
    return (
      <>
        <Container maxWidth="sm">
          <h3>Loading...</h3>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Container maxWidth="sm">
          <FancyDefaultTitle variant="h5" gutterBottom sx={{ pt: 4 }}>
            The game you are looking for does not exist
          </FancyDefaultTitle>
        </Container>
      </>
    );
  }

  return (
    <>
      <Container maxWidth="sm">
        <FancyDefaultTitle variant="h5" gutterBottom sx={{ pt: 4 }}>
          Game Finished
        </FancyDefaultTitle>
        {gameFinishDetails && (
          <div>
            <h3>Final Score: {gameFinishDetails.finalScore}</h3>
            <Link to="/">Go back to home</Link>
          </div>
        )}
      </Container>
    </>
  );
};
export default GameFinished;

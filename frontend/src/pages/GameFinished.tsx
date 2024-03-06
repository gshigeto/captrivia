import { Container } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { endGame } from "../api";
import { FancyDefaultTitle } from "../components/FancyTitle";
import PlayerScores from "../components/PlayerScores";
import { EndGameResponse, GameSession, ScoreUpdate } from "../models";
import { useGames } from "../providers/games";
import Socket, { SocketEventNames } from "../utils/socket";

const GameFinished = () => {
  const [currentGameState, setCurrentGameState] = useState<GameSession | null>(
    null
  );
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [endGameStats, setEndGameStats] = useState<EndGameResponse | null>(
    null
  );
  const [playerScores, setPlayerScores] = useState<ScoreUpdate[]>([]);

  const { currentGame } = useGames();
  const navigate = useNavigate();

  useEffect(() => {
    if (endGameStats && endGameStats.multiplayer) {
      const socket = new Socket(`/game/${currentGameState?.gameId}/ws`);
      socket.on<ScoreUpdate[]>(SocketEventNames.SCORE_UPDATE, (data) => {
        setPlayerScores(data);
      });
      socket.on<ScoreUpdate[]>(SocketEventNames.GAME_FINISHED, (data) => {
        setPlayerScores(data);
        setEndGameStats((prev) => {
          if (prev) {
            return { ...prev, finished: true };
          }
          return prev;
        });
        socket && socket.closeConnection();
      });

      return () => {
        socket && socket.closeConnection();
      };
    }
  }, [endGameStats]);

  const endGameHandler = async () => {
    try {
      const data = await endGame(
        currentGameState?.gameId!,
        currentGameState?.sessionId!
      );
      setEndGameStats(data);
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
          {endGameStats?.finished
            ? "Game Finished!"
            : "Waiting for game to finish..."}
        </FancyDefaultTitle>
        {endGameStats?.multiplayer && (
          <PlayerScores
            playerScores={playerScores}
            sessionId={currentGameState?.sessionId}
          />
        )}

        {!endGameStats?.multiplayer && (
          <div>
            <h3>Final Score: {endGameStats?.finalScore}</h3>
          </div>
        )}
      </Container>
    </>
  );
};
export default GameFinished;

import { Container } from "@mui/system";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGame, submitAnswer } from "../api";
import { FancyDefaultTitle } from "../components/FancyTitle";
import PlayerScores from "../components/PlayerScores";
import WaitingForGameStart from "../components/WaitingForGameStart";
import QuestionsContainer from "../components/questions/QuestionsContainer";
import {
  Game as GameModel,
  GameSession,
  Question,
  ScoreUpdate,
} from "../models";
import { useGames } from "../providers/games";
import { useSnackBar } from "../providers/snackbar";
import Socket, { SocketEventNames } from "../utils/socket";

const Game: React.FC = () => {
  const [currentGameState, setCurrentGameState] = useState<GameSession | null>(
    null
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [error, setError] = useState<string>("");
  const [game, setGame] = useState<GameModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [owner, setOwner] = useState<boolean>(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [playerScores, setPlayerScores] = useState<ScoreUpdate[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [waitingForGameToStart, setWaitingForGameToStart] = useState(false);

  const navigate = useNavigate();
  const { currentGame, deleteGame } = useGames();
  const { setSnackbarMessage } = useSnackBar();

  const startGame = async () => {
    setWaitingForGameToStart(false);
  };

  const getGame = async (gameId: string, sessionId: string) => {
    try {
      const game = await fetchGame(gameId, sessionId);
      setGame(game);

      // Check if finished and redirect if so
      if (game.finished) {
        navigate(`/game/finish`);
        return;
      }

      // Go to waiting room if game has not started
      if (game.multiplayer && !game.started) {
        setWaitingForGameToStart(true);
      }

      setOwner(game.owner ? true : false);
      setScore(game.currentScore);
      setCurrentQuestionIndex(game.questionIndex);
      setQuestions(game.questions);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      deleteGame(gameId);
    }
  };

  const submitAnswerHandler = async (index: number) => {
    try {
      const answerResponse = await submitAnswer(
        currentGameState?.gameId!,
        currentGameState?.sessionId!,
        questions[currentQuestionIndex].id,
        index
      );

      if (answerResponse.correct) {
        setScore(answerResponse.currentScore);
        // Got the question right, but you weren't first to answer
        if (answerResponse.alreadyAnswered) {
          setSnackbarMessage(
            "🙁 You got the question right, but you weren't first to answer"
          );
        } else {
          setSnackbarMessage("🎉 You got the question right!");
        }
      } else {
        setSnackbarMessage("❌ You got the question wrong");
      }

      // If last question, navigate to finished page
      if (currentQuestionIndex === questions.length - 1) {
        navigate(`/game/finish`);
        return;
      }

      setCurrentQuestionIndex(answerResponse.nextQuestionIndex);
    } catch (error) {}
  };

  const emitStartGame = () => {
    if (currentGameState && socket) {
      socket.emit(SocketEventNames.START_GAME, currentGameState.gameId, {});
    }
  };

  useEffect(() => {
    if (game && game.multiplayer) {
      const socket = new Socket(`/game/${game.id}/ws`);
      setSocket(socket);

      socket.on(SocketEventNames.CONNECT, () => {
        setSnackbarMessage("Connected to game room");
      });
      socket.on<{ secondsLeft: string }>(
        SocketEventNames.START_GAME_COUNTDOWN,
        (data) => {
          const seconds = Number(data.secondsLeft);
          setSecondsLeft(seconds);
        }
      );
      socket.on(SocketEventNames.START_GAME, () => {
        startGame();
      });
      socket.on<ScoreUpdate[]>(SocketEventNames.ALL_PLAYERS, (data) => {
        setPlayers(data.map((player) => player.name));
      });
      socket.on<ScoreUpdate[]>(SocketEventNames.SCORE_UPDATE, (data) => {
        setPlayerScores(data);
      });
      socket.on<{ name: string; sessionId: string }>(
        SocketEventNames.PLAYER_JOINED,
        (data) => {
          setSnackbarMessage("Player joined: " + data.name);
          setPlayers((players) => [...players, data.name]);
          setPlayerScores((playerScores) => [
            ...playerScores,
            { name: data.name, score: 0, sessionId: data.sessionId },
          ]);
        }
      );

      return () => {
        socket.closeConnection();
      };
    }
  }, [game]);

  // Set gameIdState when gameId changes
  useEffect(() => {
    if (!currentGame) {
      navigate("/");
    }

    if (currentGame && currentGame !== currentGameState) {
      setCurrentGameState(currentGame);
    }
  }, [currentGame]);

  // This should only run once when gameId param is available
  useEffect(() => {
    if (currentGameState) {
      (async () => {
        setLoading(true);
        await getGame(currentGameState.gameId, currentGameState.sessionId);
        setLoading(false);
      })();
      return;
    }
  }, [currentGameState]);

  // If loading, show loading message
  if (loading) {
    return (
      <>
        <Container maxWidth="sm">
          <h3>Loading...</h3>
        </Container>
      </>
    );
  }

  // If error, show error message
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

  // If waiting for game to start, show waiting message
  if (waitingForGameToStart) {
    return (
      <WaitingForGameStart
        secondsLeft={secondsLeft}
        currentGameState={currentGameState!}
        owner={owner}
        players={players}
        startGame={emitStartGame}
      />
    );
  }

  return (
    <>
      <Container maxWidth="sm">
        <QuestionsContainer
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          submitAnswer={submitAnswerHandler}
          score={score}
        />
        <PlayerScores
          playerScores={playerScores}
          sessionId={currentGameState?.sessionId}
        ></PlayerScores>
      </Container>
    </>
  );
};
export default Game;

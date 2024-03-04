import { Container } from "@mui/system";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchGame, submitAnswer } from "../api";
import { FancyDefaultTitle } from "../components/FancyTitle";
import QuestionsContainer from "../components/questions/QuestionsContainer";
import { GameSession, Question } from "../models";
import { useGames } from "../providers/games";

const Game: React.FC = () => {
  const { currentGame, deleteGame } = useGames();
  const navigate = useNavigate();

  const [currentGameState, setCurrentGameState] = useState<GameSession | null>(
    null
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const getGame = async (gameId: string, sessionId: string) => {
    try {
      const game = await fetchGame(gameId, sessionId);

      // Check if finished and redirect if so
      if (game.finished) {
        navigate(`/game/finish`);
        return;
      }

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
      }

      // If last question, navigate to finished page
      if (currentQuestionIndex === questions.length - 1) {
        navigate(`/game/finish`);
        return;
      }

      setCurrentQuestionIndex(answerResponse.nextQuestionIndex);
    } catch (error) {}
  };

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

  return (
    <>
      <Container maxWidth="sm">
        <QuestionsContainer
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          submitAnswer={submitAnswerHandler}
          score={score}
        />
      </Container>
    </>
  );
};
export default Game;

import { Question } from "../../models";
import QuestionComponent from "../Question";
import ScoreComponent from "../Score";

interface QuestionsContainerProps {
  questions: Question[];
  currentQuestionIndex: number;
  submitAnswer: (index: number) => void;
  score: number;
}
const QuestionsContainer = ({
  questions,
  currentQuestionIndex = 0,
  submitAnswer,
  score = 0,
}: QuestionsContainerProps) => {
  return (
    <>
      <QuestionComponent
        question={questions[currentQuestionIndex]}
        submitAnswer={submitAnswer}
      />
      {!!questions.length && <ScoreComponent score={score} />}
    </>
  );
};
export default QuestionsContainer;

import { Grid } from "@mui/material";
import { Question } from "../../models";
import QuestionComponent from "./Question";
import ScoreComponent from "./Score";

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

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={6} display="flex" alignItems="end">
          Question: {currentQuestionIndex + 1} / {questions.length}
        </Grid>
        <Grid
          item
          xs={6}
          display="flex"
          alignItems="center"
          justifyContent="end"
        >
          <ScoreComponent score={score} />
        </Grid>
      </Grid>
    </>
  );
};
export default QuestionsContainer;

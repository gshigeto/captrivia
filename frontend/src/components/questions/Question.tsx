import { Button, Stack } from "@mui/material";
import { Question } from "../../models";

interface QuestionProps {
  question: Question;
  submitAnswer: (index: number) => void;
}
const QuestionComponent: React.FC<QuestionProps> = ({
  question,
  submitAnswer,
}) => {
  return (
    <>
      <h3>{question?.questionText}</h3>
      <Stack spacing={2}>
        {question?.options.map((option, index) => (
          <Button
            variant="contained"
            onClick={() => submitAnswer(index)}
            key={index}
          >
            {option}
          </Button>
        ))}
      </Stack>
    </>
  );
};
export default QuestionComponent;

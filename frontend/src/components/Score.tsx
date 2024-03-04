import styled from "@emotion/styled";

const Score = styled.p`
  font-size: 20px;
  font-weight: bold;
  margin-top: 30px;
  color: #16a085;
`;

interface ScoreProps {
  score: number;
}
const ScoreComponent: React.FC<ScoreProps> = ({ score }) => {
  return <Score>Score: {score}</Score>;
};
export default ScoreComponent;

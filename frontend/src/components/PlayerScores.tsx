import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import { ScoreUpdate } from "../models";

interface PlayerScoresProps {
  playerScores: ScoreUpdate[];
  sessionId: string | null | undefined;
}
const PlayerScores = ({ playerScores, sessionId }: PlayerScoresProps) => {
  const sortedScores = () => {
    return playerScores.sort((a, b) => {
      if (a.score < b.score) {
        return 1;
      }
      if (a.score > b.score) {
        return -1;
      }
      return 0;
    });
  };

  return (
    <Box sx={{ mt: 8 }}>
      <Typography variant="subtitle1" gutterBottom>
        Players scores
      </Typography>
      <List>
        {sortedScores().map((player, index) => (
          <ListItem key={index}>
            <ListItemAvatar>
              <Avatar>{index + 1}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primaryTypographyProps={{
                color: player.sessionId === sessionId ? "primary" : "",
                fontWeight: player.sessionId === sessionId ? "bold" : "",
              }}
              primary={player.name}
              secondary={player.score}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
export default PlayerScores;

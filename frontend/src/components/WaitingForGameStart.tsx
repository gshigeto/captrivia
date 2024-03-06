import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import FaceIcon from "@mui/icons-material/Face";
import { LoadingButton } from "@mui/lab";
import {
  Avatar,
  Backdrop,
  Box,
  Container,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  styled,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getJoinGameUrl } from "../api";
import { GameSession } from "../models";
import { useSnackBar } from "../providers/snackbar";
import Socket, { SocketEventNames } from "../utils/socket";
import { FancyDefaultTitle } from "./FancyTitle";
const ClickableContentCopyIcon = styled(ContentCopyIcon)`
  cursor: pointer;
  position: relative;
  top: -4px;

  &:hover {
    color: #1976d2;
  }
`;

interface WaitingForGameStartProps {
  currentGameState: GameSession;
  owner: boolean;
  players: string[];
  secondsLeft: number;
  startGame: () => void;
}
const WaitingForGameStart = ({
  currentGameState,
  owner,
  players,
  secondsLeft,
  startGame,
}: WaitingForGameStartProps) => {
  const [loading, setLoading] = useState(false);

  const { setSnackbarMessage } = useSnackBar();

  return (
    <>
      <Container maxWidth="sm">
        <FancyDefaultTitle variant="h5" gutterBottom sx={{ pt: 4 }}>
          Waiting for game to start...
        </FancyDefaultTitle>

        <Typography variant="subtitle1" gutterBottom sx={{ pt: 4 }}>
          Share this link with your friends to join the game:
        </Typography>

        <Grid container spacing={1} sx={{ mt: 2 }}>
          <Grid item display="flex" alignItems="center">
            <Typography variant="subtitle2" gutterBottom>
              {getJoinGameUrl(currentGameState?.gameId!)}
            </Typography>
          </Grid>
          <Grid item xs display="flex" alignItems="center">
            <ClickableContentCopyIcon
              onClick={() => {
                navigator.clipboard.writeText(
                  getJoinGameUrl(currentGameState?.gameId!)
                );
                setSnackbarMessage("Copied!");
              }}
            >
              <ContentCopyIcon />
            </ClickableContentCopyIcon>
          </Grid>
        </Grid>

        {owner && (
          <Box style={{ textAlign: "center" }} sx={{ mt: 4 }}>
            <LoadingButton
              loading={loading}
              variant="contained"
              color="primary"
              onClick={startGame}
            >
              Start Game
            </LoadingButton>
          </Box>
        )}

        {players.length > 0 && (
          <Box sx={{ mt: 8 }}>
            <Typography variant="subtitle1" gutterBottom>
              Players in the game: {players.length}
            </Typography>
            <List>
              {players.map((player, index) => (
                <ListItem key={index}>
                  <ListItemAvatar>
                    <Avatar>
                      <FaceIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={player} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Backdrop
          sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
          open={secondsLeft > 0}
        >
          Game will start in: {secondsLeft}
        </Backdrop>
      </Container>
    </>
  );
};
export default WaitingForGameStart;

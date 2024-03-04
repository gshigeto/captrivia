import { Container, List, ListItemButton, ListItemText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { FancyDefaultTitle } from "../components/FancyTitle";
import { GameSession } from "../models";
import { useGames } from "../providers/games";

const GameList = () => {
  const { games, loadGame } = useGames();
  const navigate = useNavigate();

  const handleGameClick = (game: GameSession) => {
    loadGame(game.gameId);
    navigate("/game/play");
  };

  return (
    <>
      <Container maxWidth="sm">
        <FancyDefaultTitle
          variant="h4"
          gutterBottom
          className="title"
          sx={{ pt: 4 }}
        >
          Previous Games
        </FancyDefaultTitle>
        {games.length === 0 && <p>No games found</p>}
        {games.length > 0 && (
          <List component="nav">
            {games.map((game) => (
              <ListItemButton
                key={game.gameId}
                onClick={() => handleGameClick(game)}
              >
                <ListItemText primary={game.gameId} />
              </ListItemButton>
            ))}
          </List>
        )}
      </Container>
    </>
  );
};
export default GameList;

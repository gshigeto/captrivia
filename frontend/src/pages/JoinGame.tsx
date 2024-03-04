import { useState } from "react";
import { useNavigate } from "react-router-dom";

const joinGame = async ({ gameId, playerName }) => {
  console.log("joinGame", gameId, playerName);
  return { data: { gameId: "123" } };
  // const res = await fetch(`http://localhost:8080/game/${gameId}/join`, {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //   },
  //   body: JSON.stringify({ playerName }),
  // });
  // return res.json();
};

const JoinGame = () => {
  const [gameId, setGameId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleJoinGame = async () => {
    try {
      const { data } = await joinGame({ gameId, playerName });
      navigate(`/game/${data.gameId}`);
    } catch (error) {
      // setError(error.response.data.message);
    }
  };

  return (
    <div>
      <h1>Join Game</h1>
      <input
        type="text"
        placeholder="Game ID"
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
      />
      <input
        type="text"
        placeholder="Player Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <button onClick={handleJoinGame}>Join Game</button>
      <p>{error}</p>
    </div>
  );
};
export default JoinGame;

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LayoutComponent from "./components/Layout";
import Game from "./pages/Game";
import GameFinished from "./pages/GameFinished";
import GameList from "./pages/GameList";
import Home from "./pages/Home";
import JoinGame from "./pages/JoinGame";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LayoutComponent />}>
          <Route index element={<Home />} />
          <Route path="/join" index element={<JoinGame />} />
          <Route path="/games" index element={<GameList />} />
          <Route path="/game/play" index element={<Game />} />
          <Route path="/game/finish" index element={<GameFinished />} />
          <Route path="*" element={<Navigate to="" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import './appStyles.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home, WaitState } from '../';

export const App = () => {
  let [lobbyId, setLobbyId] = useState("");

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home openLobby={setLobbyId} />} />
          <Route path={"/lobbies/" + lobbyId} element={<WaitState id={lobbyId} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};
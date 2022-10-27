import './appStyles.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home, Join, WaitState } from '../';

export const App = () => {
  let [lobbyId, setLobbyId] = useState("none");
  let [username, setUsername] = useState("none");

  return (
    <div className="App">
      <p>
        State information (for debugging):
        <br />Lobby id: {lobbyId}
        <br />Username: {username}
      </p>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home openLobby={setLobbyId} />} />
          <Route path="/join" element={<Join openLobby={setLobbyId} />}></Route>
          <Route path={"/lobbies/:lobbyId"} element={<WaitState id={lobbyId} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};
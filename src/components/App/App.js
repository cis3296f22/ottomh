import './appStyles.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home, Join, WaitState } from '../';

export const App = () => {
  let [lobbyId, setLobbyId] = useState("hello");

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home openLobby={setLobbyId} />} />
          <Route path="/join" element={<Join />}></Route>
          <Route path={"/lobbies/" + lobbyId} element={<WaitState id={lobbyId} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};
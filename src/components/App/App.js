import './appStyles.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home, WaitState } from '../';

export const App = () => {
  let [lobbyUrl, setLobbyUrl] = useState("");

  return (
    <div className="App">
      <p>I'm {lobbyUrl}</p>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home openLobby={setLobbyUrl} />} />
          <Route path={lobbyUrl} element={<WaitState url={lobbyUrl} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};
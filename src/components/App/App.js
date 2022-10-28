import './appStyles.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { IndexPage, Join, WaitState } from '../';
import { useStore } from '../../store';

export const App = () => {
  const [username, lobbyId] = useStore((state) => [state.username, state.lobbyId]);

  return (
    <main className="app">
      <p>
        State information (for debugging):
        <br />Lobby id: {lobbyId}
        <br />Username: {username}
      </p>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<IndexPage />} />
          <Route path="/join" element={<Join />}></Route>
          <Route path={"/lobbies/:lobbyId"} element={<WaitState id={lobbyId} />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
};
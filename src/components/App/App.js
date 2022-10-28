import './appStyles.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home, Join, WaitState } from '../';
import {useStore} from '../../store';

export const App = () => {
  const [lobbyId, username] = useStore(state => [state.lobbyId, state.username]);

  return (
    <div className="app">
      <p>
        State information (for debugging):
        <br />Lobby id: {lobbyId}
        <br />Username: {username}
      </p>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/join" element={<Join />}></Route>
          <Route path={"/lobbies/:lobbyId"} element={<WaitState id={lobbyId} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};
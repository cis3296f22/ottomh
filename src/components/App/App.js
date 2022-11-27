import './appStyles.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { IndexPage, LobbyPage } from '../';

/**
 * This component wraps the HTML tree.
 * @returns {JSX.Element}
 */
export const App = () => {
  return (
    <main className="app">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<IndexPage />} />
          <Route path={"/lobbies/:lobbyId"} element={<LobbyPage />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
};
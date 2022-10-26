import './appStyles.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home, Join, WaitState } from '../';

export const App = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home/>} />
          <Route path="/new" element={<Join title="Create new lobby" />} />
          <Route path="/join" element={<Join title="Join game" />} />
          <Route path="/wait" element={<WaitState/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};
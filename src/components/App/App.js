import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home, Join } from '../';

export const App = () => {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home/>} />
          <Route path="/join" element={<Join />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Admin from './Admin';
import Join from './Join';
import Game from './Game';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/join/:sessionCode" element={<Join />} />
        <Route path="/game/:sessionCode" element={<Game />} />
        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

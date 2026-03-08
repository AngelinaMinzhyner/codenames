import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import RoomSelector from './components/RoomSelector';
import RoomWrapper from './components/RoomWrapper';

function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <div className="app">
          <Routes>
            <Route path="/" element={<RoomSelector />} />
            <Route path="/room/:roomId" element={<RoomWrapper />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </GameProvider>
    </BrowserRouter>
  );
}

export default App;

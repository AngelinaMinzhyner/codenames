import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import Lobby from './components/Lobby';
import Game from './components/Game';

function AppContent() {
  const { gameState } = useGame();

  return (
    <div className="app">
      {gameState === 'lobby' ? <Lobby /> : <Game />}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;

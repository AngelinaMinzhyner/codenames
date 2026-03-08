import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import Card from './Card';
import HintsList from './HintsList';

const Game = () => {
  const { 
    cards, 
    currentTeam, 
    currentPlayer, 
    remaining, 
    giveHint, 
    endTurn, 
    resetGame,
    winner,
    gameState,
    timeLeft,
    timerRunning,
    guessesLeft
  } = useGame();

  const [hintWord, setHintWord] = useState('');
  const [hintCount, setHintCount] = useState('');

  const handleGiveHint = (e) => {
    e.preventDefault();
    if (hintWord.trim() && hintCount > 0) {
      giveHint(hintWord.trim(), parseInt(hintCount));
      setHintWord('');
      setHintCount('');
    }
  };

  const isCaptain = currentPlayer && currentPlayer.isCaptain;
  const isCurrentTeam = currentPlayer && currentPlayer.team === currentTeam;

  return (
    <div className="game">
      {gameState === 'finished' && (
        <div className="modal show">
          <div className="modal-content">
            <h2>
              {winner === 'red' ? '🔴 Красная команда' : '🔵 Синяя команда'} победила! 🎉
            </h2>
            <button className="btn btn-large btn-primary" onClick={resetGame}>
              Вернуться в лобби
            </button>
          </div>
        </div>
      )}

      <div className="game-header">
        <h1>🎮 CodeNames</h1>
        <div className="game-status">
          <div className="team-score red-score">
            <h3>🔴 Красная</h3>
            <div className="score">{remaining.red}</div>
          </div>
          
          <div className="turn-indicator">
            <p className={`current-turn turn-${currentTeam}`}>
              Ход: {currentTeam === 'red' ? '🔴 Красная' : '🔵 Синяя'} команда
            </p>
            {currentPlayer && (
              <p className="player-role">
                Вы: {currentPlayer.name} 
                {isCaptain && ' 👑'}
                ({currentPlayer.team === 'red' ? '🔴' : '🔵'})
              </p>
            )}
          </div>
          
          <div className="team-score blue-score">
            <h3>🔵 Синяя</h3>
            <div className="score">{remaining.blue}</div>
          </div>
        </div>
      </div>

      <div className="game-main">
        <div className="game-left">
          <div className="game-board">
            {cards.map(card => (
              <Card key={card.id} card={card} />
            ))}
          </div>

          {timerRunning && (
            <div className={`timer ${timeLeft <= 10 ? 'warning' : ''}`}>
              <div className="timer-display">{timeLeft}s</div>
              <div className="timer-hint">Осталось угадываний по подсказке: {guessesLeft}</div>
              <div className="timer-bar" style={{ width: `${(timeLeft / 60) * 100}%` }}></div>
            </div>
          )}

          <div className="game-controls">
            {isCaptain && isCurrentTeam ? (
              <form onSubmit={handleGiveHint} className="hint-form">
                <input
                  type="text"
                  value={hintWord}
                  onChange={(e) => setHintWord(e.target.value)}
                  placeholder="Слово-подсказка..."
                  maxLength={30}
                />
                <input
                  type="number"
                  value={hintCount}
                  onChange={(e) => setHintCount(e.target.value)}
                  placeholder="Кол-во"
                  min="1"
                  max="9"
                />
                <button type="submit" className="btn btn-primary">
                  Дать подсказку
                </button>
              </form>
            ) : (
              <div className="player-controls">
                {isCurrentTeam && !isCaptain && (
                  <p className="info-text">Открывайте карточки вашей команды</p>
                )}
                {!isCurrentTeam && (
                  <p className="info-text">Ожидайте хода вашей команды</p>
                )}
              </div>
            )}
            
            {isCurrentTeam && !isCaptain && (
              <button className="btn btn-secondary" onClick={endTurn}>
                Закончить ход
              </button>
            )}
            
            <button className="btn btn-outline" onClick={resetGame}>
              Выйти в лобби
            </button>
          </div>
        </div>

        <div className="game-right">
          <HintsList />
        </div>
      </div>
    </div>
  );
};

export default Game;

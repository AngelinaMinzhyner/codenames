import React, { useEffect, useState } from 'react';
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
    guessesLeft,
    lastEvent
  } = useGame();

  const [hintWord, setHintWord] = useState('');
  const [hintCount, setHintCount] = useState('');
  const [turnPulse, setTurnPulse] = useState(false);
  const [eventVisible, setEventVisible] = useState(false);

  const handleGiveHint = (e) => {
    e.preventDefault();
    if (hintWord.trim() && hintCount > 0) {
      giveHint(hintWord.trim(), parseInt(hintCount, 10));
      setHintWord('');
      setHintCount('');
    }
  };

  useEffect(() => {
    setTurnPulse(true);
    const timeoutId = setTimeout(() => setTurnPulse(false), 700);
    return () => clearTimeout(timeoutId);
  }, [currentTeam]);

  useEffect(() => {
    if (!lastEvent?.id) return;
    setEventVisible(true);
    const timeoutId = setTimeout(() => setEventVisible(false), 2200);
    return () => clearTimeout(timeoutId);
  }, [lastEvent?.id]);

  const isCaptain = Boolean(currentPlayer?.isCaptain);
  const isCurrentTeam = Boolean(currentPlayer?.team === currentTeam);

  return (
    <div className="game">

      {eventVisible && lastEvent && (
        <div className={`event-banner event-${lastEvent.type} ${lastEvent.team ? `team-${lastEvent.team}` : ''}`}>
          {lastEvent.message}
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
            <p className={`current-turn turn-${currentTeam} ${turnPulse ? 'turn-pulse' : ''}`}>
              Ход: {currentTeam === 'red' ? '🔴 Красная' : '🔵 Синяя'} команда
            </p>
            {currentPlayer && (
              <p className="player-role">
                Вы: {currentPlayer.name}
                {isCaptain && ' 👑'}
                ({currentPlayer.team === 'red' ? '🔴' : currentPlayer.team === 'blue' ? '🔵' : 'без команды'})
              </p>
            )}
            {isCaptain && <p className="captain-private-hint">Капитан видит скрытые цвета карт.</p>}
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
            {cards.map((card) => (
              <Card key={card.id} card={card} />
            ))}
          </div>

          {timerRunning && (
            <div className={`timer ${timeLeft <= 10 ? 'warning' : ''}`}>
              <div className="timer-display">{timeLeft}s</div>
              <div className="timer-hint">Осталось угадываний по подсказке: {guessesLeft}</div>
              <div className="timer-bar" style={{ width: `${(timeLeft / 30) * 100}%` }}></div>
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
                {!isCurrentTeam && <p className="info-text">Ожидайте хода вашей команды</p>}
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

          {gameState === 'finished' && (
            <div className="finished-actions">
              <h2>
                {winner === 'red' ? '🔴 Красная команда' : '🔵 Синяя команда'} победила! 🎉
              </h2>
              <div className="modal-actions">
                <button className="btn btn-large btn-outline" onClick={resetGame}>
                  Вернуться в лобби
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="game-right">
          <HintsList />
        </div>
      </div>
    </div>
  );
};

export default Game;

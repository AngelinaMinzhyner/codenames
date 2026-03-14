import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import Card from './Card';
import HintsList from './HintsList';
import WhoAmIGame from './WhoAmIGame';

const Game = () => {
  const {
    selectedGame,
    cards,
    currentTeam,
    currentPlayer,
    players = [],
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
    if (!lastEvent?.id) return;
    setEventVisible(true);
    const timeoutId = setTimeout(() => setEventVisible(false), 2200);
    return () => clearTimeout(timeoutId);
  }, [lastEvent?.id]);

  const isCaptain = Boolean(currentPlayer?.isCaptain);
  const isCurrentTeam = Boolean(currentPlayer?.team === currentTeam);

  if (selectedGame === 'whoami') {
    return <WhoAmIGame />;
  }

  const blackPlayers = players.filter(p => p.team === 'black');
  const whitePlayers = players.filter(p => p.team === 'white');

  return (
    <div className="game">
      {eventVisible && lastEvent && (
        <div className={`event-banner event-${lastEvent.type} ${lastEvent.team ? `team-${lastEvent.team}` : ''}`}>
          {lastEvent.message}
        </div>
      )}

      <div className="game-header premium">
        <h1>🃏 CodeNames</h1>
      </div>

      <div className="game-main">
        {/* Левая колонка — черная команда */}
        <aside className="game-team-column black">
          <div className="game-team-title">⚫ Черная команда</div>
          <div className="game-team-players">
            {blackPlayers.length === 0 && <div className="game-team-player">Нет игроков</div>}
            {blackPlayers.map(p => (
              <div key={p.id} className={`game-team-player${p.isCaptain ? ' captain' : ''}`}>{p.name}{p.isCaptain && ' 👑'}</div>
            ))}
          </div>
          <div className="game-team-hints">
            <HintsList team="black" />
          </div>
        </aside>

        {/* Центр — поле */}
        <main className="game-left">
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
                {winner === 'black' ? '⚫ Черная команда' : '⚪ Белая команда'} победила! 🎉
              </h2>
              <div className="modal-actions">
                <button className="btn btn-large btn-outline" onClick={resetGame}>
                  Вернуться в лобби
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Правая колонка — белая команда */}
        <aside className="game-team-column white">
          <div className="game-team-title">⚪ Белая команда</div>
          <div className="game-team-players">
            {whitePlayers.length === 0 && <div className="game-team-player">Нет игроков</div>}
            {whitePlayers.map(p => (
              <div key={p.id} className={`game-team-player${p.isCaptain ? ' captain' : ''}`}>{p.name}{p.isCaptain && ' 👑'}</div>
            ))}
          </div>
          <div className="game-team-hints">
            <HintsList team="white" />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Game;

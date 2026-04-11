import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { THEMES } from '../utils/themes';
import SpyScoresPanel from './SpyScoresPanel';

const SpyGame = () => {
  const {
    currentPlayer,
    resetGame,
    startSpyGame,
    spyPlayerId,
    spyCharacterByPlayer,
    spyTurnOrder,
    selectedTheme,
    players = [],
    gameState
  } = useGame();

  const themeMeta = THEMES[selectedTheme];
  const themeName = themeMeta?.name || 'Тема';

  const isSpy = currentPlayer && spyPlayerId === currentPlayer.id;
  const character = currentPlayer ? spyCharacterByPlayer[currentPlayer.id] : null;

  const playerById = useMemo(() => {
    const m = new Map();
    players.forEach((p) => m.set(p.id, p));
    return m;
  }, [players]);

  const turnRows = useMemo(
    () =>
      spyTurnOrder.map((id) => ({
        id,
        name: playerById.get(id)?.name || 'Игрок'
      })),
    [spyTurnOrder, playerById]
  );

  const canRestartRound = players.length >= 2 && Boolean(currentPlayer);

  return (
    <div className="game spy-game">
      <header className="game-header premium">
        <h1>Шпион</h1>
      </header>

      <div className="spy-game-body">
        <p className="spy-theme-line">
          Тема: <strong>{themeName}</strong>
        </p>

        <SpyScoresPanel />

        {!currentPlayer ? (
          <p className="info-text">Войдите в комнату, чтобы увидеть роль.</p>
        ) : isSpy ? (
          <div className="spy-role-card spy-role-spy">
            <h2>Вы — шпион</h2>
            <p className="spy-role-hint">
              Вы не знаете, о ком идёт речь. Задавайте вопросы и не раскрывайте себя.
            </p>
          </div>
        ) : (
          <div className="spy-role-card spy-role-character">
            <h2>Ваш персонаж</h2>
            <p className="spy-character-name">{character || '—'}</p>
            <p className="spy-role-hint muted">
              У всех, кроме шпиона, один и тот же персонаж по этой теме. Шпион его не знает.
            </p>
          </div>
        )}

        {gameState === 'playing' && turnRows.length > 0 && (
          <div className="spy-turn-panel">
            <h3 className="spy-turn-heading">Очерёдность ходов</h3>
            <p className="spy-role-hint muted spy-turn-note">
              Порядок случайный при каждом новом раунде — ориентир, кто за кем задаёт вопросы.
            </p>
            <ol className="spy-turn-list">
              {turnRows.map((row, idx) => (
                <li key={row.id} className="spy-turn-item">
                  <span className="spy-turn-num">{idx + 1}.</span>
                  <span className="spy-turn-name">{row.name}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="spy-footer spy-footer-actions">
          {gameState === 'playing' && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={startSpyGame}
              disabled={!canRestartRound}
              title={!canRestartRound ? 'Нужны минимум 2 игрока и вход в комнату' : undefined}
            >
              Новый раунд
            </button>
          )}
          <button type="button" className="btn btn-outline" onClick={resetGame}>
            Выйти в лобби
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpyGame;

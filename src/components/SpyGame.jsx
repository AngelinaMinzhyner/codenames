import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { THEMES } from '../utils/themes';

const SpyGame = () => {
  const {
    currentPlayer,
    resetGame,
    spyPlayerId,
    spyCharacterByPlayer,
    spyTurnOrder,
    spyCurrentTurnIndex,
    advanceSpyTurn,
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
      spyTurnOrder.map((id, i) => ({
        id,
        name: playerById.get(id)?.name || 'Игрок',
        isCurrent: gameState === 'playing' && i === spyCurrentTurnIndex
      })),
    [spyTurnOrder, playerById, spyCurrentTurnIndex, gameState]
  );

  const currentTurnName =
    turnRows.length > 0 && spyCurrentTurnIndex < turnRows.length
      ? turnRows[spyCurrentTurnIndex].name
      : null;

  return (
    <div className="game spy-game">
      <header className="game-header premium">
        <h1>Шпион</h1>
      </header>

      <div className="spy-game-body">
        <p className="spy-theme-line">
          Тема: <strong>{themeName}</strong>
        </p>

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
            {currentTurnName && (
              <p className="spy-turn-current">
                Сейчас ход: <strong>{currentTurnName}</strong>
              </p>
            )}
            <ol className="spy-turn-list">
              {turnRows.map((row, idx) => (
                <li
                  key={row.id}
                  className={`spy-turn-item ${row.isCurrent ? 'spy-turn-item-current' : ''}`}
                >
                  <span className="spy-turn-num">{idx + 1}.</span>
                  <span className="spy-turn-name">{row.name}</span>
                  {row.isCurrent && <span className="spy-turn-badge">ход</span>}
                </li>
              ))}
            </ol>
            <button type="button" className="btn btn-secondary spy-next-turn" onClick={advanceSpyTurn}>
              Следующий ход
            </button>
            <p className="spy-role-hint muted spy-turn-note">
              Порядок случайный в каждой новой игре. Нажмите, когда игрок закончил ход.
            </p>
          </div>
        )}

        <div className="spy-footer">
          <button type="button" className="btn btn-outline" onClick={resetGame}>
            Выйти в лобби
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpyGame;

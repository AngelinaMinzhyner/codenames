import React, { useMemo } from 'react';
import { useGame } from '../context/GameContext';

/**
 * Счёт за сессию в комнате: после раунда кто угодно из вошедших игроков нажимает +1 победителю.
 */
const SpyScoresPanel = () => {
  const { players = [], spyScores, awardSpyRoundPoint, currentPlayer, selectedGame } = useGame();

  const rows = useMemo(() => {
    return [...players]
      .map((p) => ({
        id: p.id,
        name: p.name,
        score: typeof spyScores?.[p.id] === 'number' ? spyScores[p.id] : 0
      }))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, 'ru'));
  }, [players, spyScores]);

  if (selectedGame !== 'spy' || players.length === 0) {
    return null;
  }

  return (
    <div className="spy-scores-panel">
      <h3 className="spy-scores-heading">Счёт в комнате</h3>
      <p className="spy-scores-hint">
        После раунда договоритесь, кто победил, и нажмите «+1» у этого игрока. Очки хранятся в этой комнате,
        пока вы в ней играете.
      </p>
      <ul className="spy-scores-list">
        {rows.map((row) => (
          <li key={row.id} className="spy-scores-row">
            <span className="spy-scores-name">{row.name}</span>
            <span className="spy-scores-value">{row.score}</span>
            {currentPlayer && (
              <button
                type="button"
                className="btn btn-small spy-scores-plus"
                onClick={() => awardSpyRoundPoint(row.id)}
                title="Победа в раунде"
              >
                +1
              </button>
            )}
          </li>
        ))}
      </ul>
      {!currentPlayer && (
        <p className="spy-role-hint muted spy-scores-login">Войдите под именем, чтобы начислять очки.</p>
      )}
    </div>
  );
};

export default SpyScoresPanel;

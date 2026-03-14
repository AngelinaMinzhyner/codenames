import React from 'react';
import { useGame } from '../context/GameContext';

const HintsList = ({ team }) => {
  const { hints, currentTeam } = useGame();
  const teamHints = team ? hints.filter(h => h.team === team) : hints;

  if (teamHints.length === 0) {
    return (
      <div className="hints-list">
        <h3>📝 Подсказки</h3>
        <p className="empty-hints">Подсказок пока нет</p>
      </div>
    );
  }

  return (
    <div className="hints-list">
      <h3>📝 Подсказки</h3>
      <div className="hints-container">
        {teamHints.map(hint => (
          <div
            key={hint.id}
            className={`hint-item hint-${hint.team} ${hint.team === currentTeam ? 'current' : ''}`}
          >
            <div className="hint-header">
              <span className="hint-team">
                {hint.team === 'black' ? '⚫' : '⚪'}
              </span>
              <span className="hint-captain">{hint.captainName}</span>
            </div>
            <div className="hint-content">
              <span className="hint-word">{hint.word}</span>
              <span className="hint-count">({hint.count})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HintsList;

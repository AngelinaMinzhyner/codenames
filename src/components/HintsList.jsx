import React from 'react';
import { useGame } from '../context/GameContext';

const HintsList = () => {
  const { hints, currentTeam } = useGame();

  if (hints.length === 0) {
    return (
      <div className="hints-list">
        <h3>📝 История подсказок</h3>
        <p className="empty-hints">Подсказок пока нет</p>
      </div>
    );
  }

  return (
    <div className="hints-list">
      <h3>📝 История подсказок</h3>
      <div className="hints-container">
        {hints.map(hint => (
          <div 
            key={hint.id} 
            className={`hint-item hint-${hint.team} ${hint.team === currentTeam ? 'current' : ''}`}
          >
            <div className="hint-header">
              <span className="hint-team">
                {hint.team === 'red' ? '🔴' : '🔵'}
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

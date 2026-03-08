import React from 'react';
import { useGame } from '../context/GameContext';

const Card = ({ card }) => {
  const { currentPlayer, revealCard } = useGame();

  const handleClick = () => {
    revealCard(card.id);
  };

  const getCardClass = () => {
    let classes = 'card';
    
    if (card.revealed) {
      classes += ` revealed revealed-${card.type} flip-animation`;
    } else if (currentPlayer && currentPlayer.isCaptain) {
      classes += ` captain-view captain-view-${card.type}`;
    }
    
    return classes;
  };

  return (
    <div className={getCardClass()} onClick={handleClick}>
      <span className="card-word">{card.word}</span>
      {card.revealed && card.type === 'bomb' && <span className="bomb-icon">💣</span>}
    </div>
  );
};

export default Card;

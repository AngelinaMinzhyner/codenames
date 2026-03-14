import React from 'react';
import { useGame } from '../context/GameContext';

const Card = ({ card }) => {
  const { currentPlayer, revealCard } = useGame();

  const isCaptain = Boolean(currentPlayer?.isCaptain);
  const cardLocked = !currentPlayer || isCaptain;

  const handleClick = () => {
    if (cardLocked || card.revealed) return;
    revealCard(card.id);
  };

  const getCardClass = () => {
    let classes = 'card';

    if (card.revealed) {
      classes += ` revealed revealed-${card.type} flip-animation`;
    } else {
      if (isCaptain) {
        classes += ` captain-view captain-view-${card.type}`;
      }
      if (cardLocked) {
        classes += ' card-locked';
      }
    }

    return classes;
  };

  // Для нейтральной открытой карточки — показываем пустое место
  const isNeutralRevealed = card.revealed && card.type === 'neutral';
  return (
    <div className={getCardClass()} onClick={handleClick}>
      {isNeutralRevealed ? (
        <span className="card-neutral-placeholder"></span>
      ) : (
        <span className="card-word">{card.word}</span>
      )}
      {card.revealed && card.type === 'bomb' && <span className="bomb-icon">💣</span>}
    </div>
  );
};

export default Card;

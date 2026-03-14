import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';

const WhoAmIPlayerColumn = ({
  player,
  currentPlayer,
  assignment,
  note,
  onAssign,
  onSaveNote
}) => {
  const isSelf = currentPlayer?.id === player.id;
  const [wordInput, setWordInput] = useState(assignment?.word || '');
  const [noteDraft, setNoteDraft] = useState(note?.text || '');

  useEffect(() => {
    setWordInput(assignment?.word || '');
  }, [assignment?.word]);

  useEffect(() => {
    setNoteDraft(note?.text || '');
  }, [note?.text]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onAssign(player.id, wordInput);
  };

  return (
    <article className={`whoami-column ${isSelf ? 'self' : ''}`}>
      <div className="whoami-column-header">
        <h3>{player.name}</h3>
        <span className="whoami-badge">{isSelf ? 'Ваш столбец' : 'Цель для слова'}</span>
      </div>

      <div className="whoami-word-panel">
        <div className="whoami-label">Слово</div>
        {isSelf ? (
          <div className="whoami-secret-word hidden-word">Это слово скрыто от вас</div>
        ) : assignment?.word ? (
          <>
            <div className="whoami-secret-word">{assignment.word}</div>
            <div className="whoami-word-meta">Назначил: {assignment.updatedByName}</div>
          </>
        ) : (
          <div className="whoami-placeholder">Слово еще не назначено</div>
        )}
      </div>

      {!isSelf && (
        <form className="whoami-word-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={wordInput}
            onChange={(event) => setWordInput(event.target.value)}
            placeholder="Написать случайное слово..."
            maxLength={40}
          />
          <div className="whoami-form-actions">
            <button type="submit" className="btn btn-primary">Сохранить слово</button>
            <button type="button" className="btn btn-outline" onClick={() => onAssign(player.id, '')}>
              Очистить
            </button>
          </div>
        </form>
      )}

      {isSelf && (
        <div className="whoami-notes-box">
          <div className="whoami-label">Личные заметки</div>
          <textarea
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            placeholder="Записывайте догадки, вопросы и свои подсказки..."
            rows={8}
          />
          <button type="button" className="btn btn-secondary" onClick={() => onSaveNote(noteDraft)}>
            Сохранить заметки
          </button>
        </div>
      )}
    </article>
  );
};

const WhoAmIGame = () => {
  const {
    players,
    currentPlayer,
    whoAmIAssignments,
    whoAmINotes,
    assignWhoAmIWord,
    updateWhoAmINote,
    resetGame,
    lastEvent
  } = useGame();

  return (
    <div className="game whoami-game">
      {lastEvent && <div className="event-banner event-start">{lastEvent.message}</div>}

      <div className="whoami-header">
        <div>
          <h1>🪪 Кто я</h1>
          <p>Каждый видит слова всех игроков, кроме своего собственного.</p>
        </div>
        {currentPlayer && (
          <div className="whoami-current-player">
            Вы вошли как <strong>{currentPlayer.name}</strong>
          </div>
        )}
      </div>

      <div className="whoami-columns">
        {players.map((player) => (
          <WhoAmIPlayerColumn
            key={player.id}
            player={player}
            currentPlayer={currentPlayer}
            assignment={whoAmIAssignments[player.id]}
            note={whoAmINotes[player.id]}
            onAssign={assignWhoAmIWord}
            onSaveNote={updateWhoAmINote}
          />
        ))}
      </div>

      <div className="whoami-footer">
        <button className="btn btn-large btn-outline" onClick={resetGame}>
          Вернуться в лобби
        </button>
      </div>
    </div>
  );
};

export default WhoAmIGame;
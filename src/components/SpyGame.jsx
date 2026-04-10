import React from 'react';
import { useGame } from '../context/GameContext';
import { THEMES } from '../utils/themes';

const SpyGame = () => {
  const {
    currentPlayer,
    resetGame,
    spyPlayerId,
    spyCharacterByPlayer,
    selectedTheme
  } = useGame();

  const themeMeta = THEMES[selectedTheme];
  const themeName = themeMeta?.name || 'Тема';

  const isSpy = currentPlayer && spyPlayerId === currentPlayer.id;
  const character = currentPlayer ? spyCharacterByPlayer[currentPlayer.id] : null;

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
              Остальные игроки (кроме одного шпиона) получили своих персонажей по этой теме.
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

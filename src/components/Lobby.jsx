import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { getThemesList } from '../utils/themes';

const Lobby = () => {
  const { players, currentPlayer, addPlayer, joinTeam, becomeCaptain, startGame, selectedTheme, setSelectedTheme, synced } = useGame();
  const [nameInput, setNameInput] = useState('');
  const themes = getThemesList();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      try {
        await addPlayer(nameInput.trim());
        setNameInput('');
      } catch (error) {
        alert(error?.message || 'Не удалось войти в комнату. Проверьте Firebase настройки и попробуйте снова.');
      }
    }
  };

  const redTeam = players.filter(p => p.team === 'red');
  const blueTeam = players.filter(p => p.team === 'blue');
  const waiting = players.filter(p => !p.team);
  const redCaptain = redTeam.find(p => p.isCaptain);
  const blueCaptain = blueTeam.find(p => p.isCaptain);

  const bothCaptainsReady = Boolean(redCaptain?.readyToStart && blueCaptain?.readyToStart);
  const isCurrentPlayerCaptain = Boolean(currentPlayer?.isCaptain);
  const isCurrentCaptainReady = Boolean(currentPlayer?.readyToStart);

  const canStart = redTeam.length > 0 && blueTeam.length > 0 &&
                   redTeam.some(p => p.isCaptain) && blueTeam.some(p => p.isCaptain);

  return (
    <div className="lobby">
      <div className="lobby-header">
        <h1>🎮 CodeNames - Лобби</h1>
        {!currentPlayer ? (
          <form onSubmit={handleJoin} className="join-form">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Введите ваше имя..."
              maxLength={20}
              disabled={!synced}
            />
            <button type="submit" className="btn btn-primary" disabled={!synced}>
              {synced ? 'Войти в игру' : 'Подключение к комнате...'}
            </button>
          </form>
        ) : (
          <div className="player-info">
            <p>Добро пожаловать, <strong>{currentPlayer.name}</strong>!</p>
            {!currentPlayer.team && (
              <p className="hint-text">Выберите команду ниже</p>
            )}
          </div>
        )}
      </div>

      <div className="teams-container">
        <div className="team-lobby red-team-lobby">
          <h2>🔴 Красная команда</h2>
          <div className="team-members">
            {redTeam.length === 0 ? (
              <p className="empty-team">Команда пуста</p>
            ) : (
              redTeam.map(player => (
                <div key={player.id} className={`player-card ${player.isCaptain ? 'captain' : ''}`}>
                  <span className="player-name">{player.name}</span>
                  {player.isCaptain && <span className="captain-badge">👑 Капитан</span>}
                  {currentPlayer && currentPlayer.id === player.id && !player.isCaptain && (
                    <button
                      className="btn-small"
                      onClick={() => becomeCaptain(player.id, 'red')}
                    >
                      Стать капитаном
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          {currentPlayer && currentPlayer.team !== 'red' && (
            <button
              className="btn btn-team-red"
              onClick={() => joinTeam(currentPlayer.id, 'red')}
            >
              Присоединиться
            </button>
          )}
        </div>

        <div className="team-lobby blue-team-lobby">
          <h2>🔵 Синяя команда</h2>
          <div className="team-members">
            {blueTeam.length === 0 ? (
              <p className="empty-team">Команда пуста</p>
            ) : (
              blueTeam.map(player => (
                <div key={player.id} className={`player-card ${player.isCaptain ? 'captain' : ''}`}>
                  <span className="player-name">{player.name}</span>
                  {player.isCaptain && <span className="captain-badge">👑 Капитан</span>}
                  {currentPlayer && currentPlayer.id === player.id && !player.isCaptain && (
                    <button
                      className="btn-small"
                      onClick={() => becomeCaptain(player.id, 'blue')}
                    >
                      Стать капитаном
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          {currentPlayer && currentPlayer.team !== 'blue' && (
            <button
              className="btn btn-team-blue"
              onClick={() => joinTeam(currentPlayer.id, 'blue')}
            >
              Присоединиться
            </button>
          )}
        </div>
      </div>

      {waiting.length > 0 && (
        <div className="waiting-players">
          <h3>Ожидают выбора команды:</h3>
          <div className="waiting-list">
            {waiting.map(player => (
              <span key={player.id} className="waiting-player">{player.name}</span>
            ))}
          </div>
        </div>
      )}

      <div className="theme-selection">
        <h3>🎭 Выберите тему слов:</h3>
        <div className="themes-grid">
          {themes.map(theme => (
            <button
              key={theme.id}
              className={`theme-button ${selectedTheme === theme.id ? 'active' : ''}`}
              onClick={() => setSelectedTheme(theme.id)}
            >
              <div className="theme-name">{theme.name}</div>
              <div className="theme-difficulty">Сложность: {theme.difficulty}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="lobby-footer">
        <div className="lobby-info">
          {!canStart && (
            <p className="warning-text">
              ⚠️ Для начала игры нужны игроки в обеих командах и по капитану в каждой
            </p>
          )}
          {canStart && (
            <p className="hint-text">
              Старт: оба капитана должны нажать кнопку.
              Готовность: 🔴 {redCaptain?.readyToStart ? 'готов' : 'не готов'} | 🔵 {blueCaptain?.readyToStart ? 'готов' : 'не готов'}
            </p>
          )}
        </div>
        <button
          className="btn btn-large btn-start"
          onClick={startGame}
          disabled={!canStart || !isCurrentPlayerCaptain}
        >
          {!isCurrentPlayerCaptain
            ? 'Только капитан может подтвердить старт'
            : bothCaptainsReady
            ? 'Оба капитана готовы - начать игру'
            : isCurrentCaptainReady
            ? 'Вы готовы, ожидаем второго капитана'
            : 'Капитан: подтвердить готовность'}
        </button>
      </div>
    </div>
  );
};

export default Lobby;

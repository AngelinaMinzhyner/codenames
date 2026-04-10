import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getThemesList, SPY_THEME_IDS } from '../utils/themes';
import { GAME_OPTIONS } from '../utils/games';

const Lobby = () => {
  const {
    players,
    currentPlayer,
    addPlayer,
    joinTeam,
    becomeCaptain,
    startGame,
    startWhoAmIGame,
    startSpyGame,
    selectedTheme,
    selectTheme,
    selectedGame,
    selectGame,
    synced
  } = useGame();
  const [nameInput, setNameInput] = useState('');
  const themes = getThemesList();
  const spyThemes = SPY_THEME_IDS.map((id) => themes.find((t) => t.id === id)).filter(Boolean);

  useEffect(() => {
    if (selectedGame !== 'spy' || !synced) return;
    if (!SPY_THEME_IDS.includes(selectedTheme)) {
      selectTheme(SPY_THEME_IDS[0]);
    }
  }, [selectedGame, selectedTheme, selectTheme, synced]);

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

  const blackTeam = players.filter(p => p.team === 'black');
  const whiteTeam = players.filter(p => p.team === 'white');
  const waiting = players.filter(p => !p.team);
  const blackCaptain = blackTeam.find(p => p.isCaptain);
  const whiteCaptain = whiteTeam.find(p => p.isCaptain);

  const bothCaptainsReady = Boolean(blackCaptain?.readyToStart && whiteCaptain?.readyToStart);
  const isCurrentPlayerCaptain = Boolean(currentPlayer?.isCaptain);
  const isCurrentCaptainReady = Boolean(currentPlayer?.readyToStart);

  const canStart = blackTeam.length > 0 && whiteTeam.length > 0 &&
                   blackTeam.some(p => p.isCaptain) && whiteTeam.some(p => p.isCaptain);
  const canStartWhoAmI = players.length >= 2 && Boolean(currentPlayer);
  const canStartSpy = players.length >= 2 && Boolean(currentPlayer);

  const renderJoinBlock = () => (
    !currentPlayer ? (
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
          {synced ? 'Войти в комнату' : 'Подключение к комнате...'}
        </button>
      </form>
    ) : (
      <div className="player-info">
        <p>Добро пожаловать, <strong>{currentPlayer.name}</strong>!</p>
        {!selectedGame && <p className="hint-text">Сначала выберите игру для комнаты</p>}
        {selectedGame === 'codenames' && !currentPlayer.team && (
          <p className="hint-text">Выберите команду ниже</p>
        )}
        {selectedGame === 'whoami' && (
          <p className="hint-text">После старта остальные игроки смогут назначать вам слово.</p>
        )}
        {selectedGame === 'spy' && (
          <p className="hint-text">Выберите тему и начните игру — роли и шпион назначаются случайно.</p>
        )}
      </div>
    )
  );

  const renderGamePicker = () => (
    <div className="game-picker">
      <div className="section-heading">
        <h2>Выбор игры</h2>
        <p>Комната одна, режим можно переключать в лобби.</p>
      </div>
      <div className="game-picker-grid">
        {GAME_OPTIONS.map((game) => (
          <button
            key={game.id}
            className={`game-picker-card ${game.accent} ${selectedGame === game.id ? 'active' : ''}`}
            onClick={() => selectGame(game.id)}
            type="button"
          >
            <div className="game-picker-title">{game.name}</div>
            <div className="game-picker-description">{game.description}</div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderCodenamesLobby = () => (
    <>
      <div className="teams-container">
        <div className="team-lobby black-team-lobby">
          <h2>⚫ Черная команда</h2>
          <div className="team-members">
            {blackTeam.length === 0 ? (
              <p className="empty-team">Команда пуста</p>
            ) : (
              blackTeam.map(player => (
                <div key={player.id} className={`player-card ${player.isCaptain ? 'captain' : ''}`}>
                  <span className="player-name">{player.name}</span>
                  {player.isCaptain && <span className="captain-badge">👑 Капитан</span>}
                  {currentPlayer && currentPlayer.id === player.id && !player.isCaptain && (
                    <button
                      className="btn-small"
                      onClick={() => becomeCaptain(player.id, 'black')}
                    >
                      Стать капитаном
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          {currentPlayer && currentPlayer.team !== 'black' && (
            <button
              className="btn btn-team-black"
              onClick={() => joinTeam(currentPlayer.id, 'black')}
            >
              Присоединиться
            </button>
          )}
        </div>

        <div className="team-lobby white-team-lobby">
          <h2>⚪ Белая команда</h2>
          <div className="team-members">
            {whiteTeam.length === 0 ? (
              <p className="empty-team">Команда пуста</p>
            ) : (
              whiteTeam.map(player => (
                <div key={player.id} className={`player-card ${player.isCaptain ? 'captain' : ''}`}>
                  <span className="player-name">{player.name}</span>
                  {player.isCaptain && <span className="captain-badge">👑 Капитан</span>}
                  {currentPlayer && currentPlayer.id === player.id && !player.isCaptain && (
                    <button
                      className="btn-small"
                      onClick={() => becomeCaptain(player.id, 'white')}
                    >
                      Стать капитаном
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          {currentPlayer && currentPlayer.team !== 'white' && (
            <button
              className="btn btn-team-white"
              onClick={() => joinTeam(currentPlayer.id, 'white')}
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
              onClick={() => selectTheme(theme.id)}
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
              Готовность: ⚫ {blackCaptain?.readyToStart ? 'готов' : 'не готов'} | ⚪ {whiteCaptain?.readyToStart ? 'готов' : 'не готов'}
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
    </>
  );

  const renderSpyLobby = () => (
    <div className="whoami-lobby spy-lobby">
      <div className="section-heading">
        <h2>Лобби «Шпион»</h2>
        <p>
          По выбранной теме большинство получает случайного персонажа. Один игрок — шпион и не знает персонажа.
          Дальше играйте вживую, в приложении только роли.
        </p>
      </div>

      <div className="whoami-lobby-grid">
        {players.map((player) => (
          <div key={player.id} className={`whoami-player-tile ${currentPlayer?.id === player.id ? 'self' : ''}`}>
            <div className="player-name">{player.name}</div>
            <div className="whoami-player-meta">
              {currentPlayer?.id === player.id ? 'Это вы' : 'Участник раунда'}
            </div>
          </div>
        ))}
      </div>

      <div className="theme-selection">
        <h3>Тема персонажей</h3>
        <div className="themes-grid">
          {spyThemes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`theme-button ${selectedTheme === theme.id ? 'active' : ''}`}
              onClick={() => selectTheme(theme.id)}
            >
              <div className="theme-name">{theme.name}</div>
              <div className="theme-difficulty">
                {Array.isArray(theme.words) && theme.words.length === 0
                  ? 'Список пуст — задайте слова в themes.js'
                  : `Карточек: ${theme.words?.length ?? 0}`}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="lobby-footer">
        <div className="lobby-info">
          {!canStartSpy && (
            <p className="warning-text">
              Нужно минимум 2 игрока в комнате и ваш вход по имени
            </p>
          )}
          {canStartSpy && (
            <p className="hint-text">
              Старт перераспределяет шпиона и персонажей заново для текущего списка игроков.
            </p>
          )}
        </div>
        <button
          className="btn btn-large btn-start"
          onClick={startSpyGame}
          disabled={!canStartSpy}
        >
          Начать «Шпион»
        </button>
      </div>
    </div>
  );

  const renderWhoAmILobby = () => (
    <div className="whoami-lobby">
      <div className="section-heading">
        <h2>Лобби игры «Кто я»</h2>
        <p>После старта у каждого игрока будет своя колонка. Остальные смогут назначать ему слово, а сам игрок увидит только свои заметки.</p>
      </div>

      <div className="whoami-lobby-grid">
        {players.map((player) => (
          <div key={player.id} className={`whoami-player-tile ${currentPlayer?.id === player.id ? 'self' : ''}`}>
            <div className="player-name">{player.name}</div>
            <div className="whoami-player-meta">
              {currentPlayer?.id === player.id ? 'Это вы' : 'Получит слово от остальных'}
            </div>
          </div>
        ))}
      </div>

      <div className="lobby-footer">
        <div className="lobby-info">
          {!canStartWhoAmI && (
            <p className="warning-text">⚠️ Для старта нужны минимум 2 игрока и ваш вход в комнату</p>
          )}
          {canStartWhoAmI && (
            <p className="hint-text">После старта любой участник сможет назначать или менять слова другим игрокам.</p>
          )}
        </div>
        <button
          className="btn btn-large btn-start"
          onClick={startWhoAmIGame}
          disabled={!canStartWhoAmI}
        >
          Начать «Кто я»
        </button>
      </div>
    </div>
  );

  return (
    <div className="lobby">
      <div className="lobby-header">
        <h1>🎮 Игровое лобби</h1>
        {renderJoinBlock()}
      </div>

      {renderGamePicker()}

      {!selectedGame && (
        <div className="empty-game-state">
          <h2>Выберите режим выше</h2>
          <p>После выбора игра настроится для всей комнаты.</p>
        </div>
      )}

      {selectedGame === 'codenames' && renderCodenamesLobby()}
      {selectedGame === 'whoami' && renderWhoAmILobby()}
      {selectedGame === 'spy' && renderSpyLobby()}
    </div>
  );
};

export default Lobby;

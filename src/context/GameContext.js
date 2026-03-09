import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { generateCards, checkWinner, countRemaining } from '../utils/gameLogic';
import { getThemeWords } from '../utils/themes';
import { ensureAuth } from '../utils/firebase';
import { ref, onValue, set, update, off } from 'firebase/database';
import { db } from '../utils/firebase';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame должен использоваться внутри GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState('lobby');
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentTeam, setCurrentTeam] = useState('red');
  const [hints, setHints] = useState([]);
  const [winner, setWinner] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('classic');
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [guessesLeft, setGuessesLeft] = useState(0);
  const [rematchVotes, setRematchVotes] = useState({});
  const [lastEvent, setLastEvent] = useState(null);
  
  // Firebase
  const [roomId, setRoomId] = useState(null);
  const [synced, setSynced] = useState(false);

  const roomIdRef = useRef(roomId);
  const currentPlayerRef = useRef(currentPlayer);

  const getClientId = useCallback(() => {
    const key = 'codenames_client_id';
    let clientId = localStorage.getItem(key);
    if (!clientId) {
      clientId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(key, clientId);
    }
    return clientId;
  }, []);

  const getPlayerStorageKey = useCallback((rid) => `currentPlayerId_${rid}`, []);

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useEffect(() => {
    currentPlayerRef.current = currentPlayer;
  }, [currentPlayer]);

  // Синхронизация с Firebase
  const syncWithFirebase = useCallback(async (newRoomId) => {
    if (!db || !newRoomId) return;
    setRoomId(newRoomId);
    try {
      await ensureAuth();
    } catch (error) {
      console.error('Auth error while syncing room:', error);
    }
    
    // Подписка на изменения комнаты
    const roomRef = ref(db, `rooms/${newRoomId}`);
    
    onValue(roomRef, (snapshot) => {
      const roomData = snapshot.val();
      if (!roomData) return;

      // Синхронизируем игроков
      if (roomData.players) {
        const playersList = Object.values(roomData.players);
        setPlayers(playersList);
      } else {
        setPlayers([]);
      }

      // Синхронизируем состояние игры
      if (roomData.gameState) {
        const gs = roomData.gameState;
        setGameState(gs.status || 'lobby');
        if (gs.cards) setCards(gs.cards);
        if (gs.currentTeam) setCurrentTeam(gs.currentTeam);
        if (gs.selectedTheme) setSelectedTheme(gs.selectedTheme);
        if (gs.winner) setWinner(gs.winner);
        if (gs.timeLeft !== undefined) setTimeLeft(gs.timeLeft);
        if (gs.timerRunning !== undefined) setTimerRunning(gs.timerRunning);
        if (gs.guessesLeft !== undefined) setGuessesLeft(gs.guessesLeft);
        setRematchVotes(gs.rematchVotes || {});
        setLastEvent(gs.lastEvent || null);
      } else {
        setRematchVotes({});
        setLastEvent(null);
      }

      // Синхронизируем подсказки
      if (roomData.hints) {
        const hintsList = Object.values(roomData.hints).sort((a, b) => b.id - a.id);
        setHints(hintsList);
      }
      setSynced(true);
    }, (error) => {
      console.error('Room sync error:', error);
      setSynced(false);
    });

    return () => {
      off(roomRef);
    };
  }, []);

  // Таймер
  useEffect(() => {
    let interval;
    if (timerRunning && timeLeft > 0 && roomId) {
      ensureAuth().catch(() => null);
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setTimerRunning(false);
            const nextTeam = currentTeam === 'red' ? 'blue' : 'red';
            update(ref(db, `rooms/${roomId}/gameState`), {
              timerRunning: false,
              timeLeft: 0,
              guessesLeft: 0,
              currentTeam: nextTeam,
              lastEvent: {
                id: Date.now(),
                type: 'timeout',
                message: 'Время вышло. Ход передан сопернику.',
                team: nextTeam
              }
            });
            return 0;
          }
          // Обновляем время в Firebase каждые 5 секунд
          if (newTime % 5 === 0) {
            update(ref(db, `rooms/${roomId}/gameState`), { timeLeft: newTime });
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft, roomId, currentTeam]);

  // Добавить игрока
  const addPlayer = async (name) => {
    if (!roomId) {
      throw new Error('Подключение к комнате еще не завершено. Попробуйте через 1-2 секунды.');
    }
    await ensureAuth();

    const clientId = getClientId();
    const existingPlayer = players.find((p) => p.clientId === clientId);

    if (existingPlayer) {
      const updatedPlayer = { ...existingPlayer, name };
      await update(ref(db, `rooms/${roomId}/players/${existingPlayer.id}`), {
        name,
        lastSeenAt: Date.now()
      });
      setCurrentPlayer(updatedPlayer);
      localStorage.setItem(getPlayerStorageKey(roomId), existingPlayer.id);
      return updatedPlayer;
    }

    const newPlayer = {
      id: Date.now().toString(),
      clientId,
      name,
      team: null,
      isCaptain: false,
      readyToStart: false,
      joinedAt: Date.now(),
      lastSeenAt: Date.now()
    };

    // Добавляем в Firebase
    await set(ref(db, `rooms/${roomId}/players/${newPlayer.id}`), newPlayer);

    setCurrentPlayer(newPlayer);
    localStorage.setItem(getPlayerStorageKey(roomId), newPlayer.id);
    
    return newPlayer;
  };

  // Выбрать команду
  const joinTeam = async (playerId, team) => {
    if (!roomId) return;
    await ensureAuth();
    
    await update(ref(db, `rooms/${roomId}/players/${playerId}`), {
      team,
      readyToStart: false,
      isCaptain: false
    });
  };

  // Стать капитаном
  const becomeCaptain = async (playerId, team) => {
    if (!roomId) return;
    await ensureAuth();

    const updates = {};
    
    // Снимаем капитанство со всех в команде
    players.forEach(p => {
      if (p.team === team) {
        updates[`rooms/${roomId}/players/${p.id}/isCaptain`] = p.id === playerId;
        updates[`rooms/${roomId}/players/${p.id}/readyToStart`] = false;
      }
    });

    await update(ref(db), updates);
  };

  // Начать игру
  const startGame = async () => {
    if (!roomId) return;
    await ensureAuth();

    const redTeam = players.filter(p => p.team === 'red');
    const blueTeam = players.filter(p => p.team === 'blue');
    
    if (redTeam.length === 0 || blueTeam.length === 0) {
      alert('Обе команды должны иметь хотя бы одного игрока!');
      return;
    }

    const redCaptain = redTeam.find(p => p.isCaptain);
    const blueCaptain = blueTeam.find(p => p.isCaptain);

    if (!redCaptain || !blueCaptain) {
      alert('В каждой команде должен быть капитан!');
      return;
    }

    if (!currentPlayer || !currentPlayer.isCaptain) {
      alert('Только капитаны могут подтверждать старт игры.');
      return;
    }

    // Капитан подтверждает готовность к старту.
    await update(ref(db, `rooms/${roomId}/players/${currentPlayer.id}`), {
      readyToStart: true
    });

    const redReady = redCaptain.readyToStart || redCaptain.id === currentPlayer.id;
    const blueReady = blueCaptain.readyToStart || blueCaptain.id === currentPlayer.id;

    if (!redReady || !blueReady) {
      alert('Готовность принята. Ожидаем подтверждение второго капитана.');
      return;
    }

    const themeWords = getThemeWords(selectedTheme);
    const newCards = generateCards(themeWords);
    const firstTeam = Math.random() < 0.5 ? 'red' : 'blue';

    // Публикуем состояние игры в Firebase
    await set(ref(db, `rooms/${roomId}/gameState`), {
      status: 'playing',
      cards: newCards,
      currentTeam: firstTeam,
      selectedTheme,
      winner: null,
      timeLeft: 60,
      timerRunning: false,
      guessesLeft: 0,
      rematchVotes: {},
      lastEvent: {
        id: Date.now(),
        type: 'start',
        message: `Игра началась. Первыми ходят ${firstTeam === 'red' ? 'красные' : 'синие'}.`,
        team: firstTeam
      },
      startedAt: Date.now()
    });

    // Очищаем подсказки
    await set(ref(db, `rooms/${roomId}/hints`), {});
  };

  // Открыть карту
  const revealCard = async (cardId) => {
    if (!roomId || gameState !== 'playing') return;
    await ensureAuth();

    if (!currentPlayer) {
      alert('Сначала войдите в игру.');
      return;
    }

    const card = cards.find(c => c.id === cardId);
    if (!card || card.revealed) return;

    if (currentPlayer.isCaptain) {
      alert('Капитан не может открывать карты!');
      return;
    }

    if (currentPlayer.team !== currentTeam) {
      alert('Сейчас ход другой команды!');
      return;
    }

    if (!timerRunning || guessesLeft <= 0) {
      alert('Сначала капитан должен дать подсказку.');
      return;
    }

    const updatedCards = cards.map(c =>
      c.id === cardId ? { ...c, revealed: true } : c
    );

    // Проверяем победу
    const gameWinner = checkWinner(updatedCards);
    let newWinner = null;

    if (gameWinner) {
      if (gameWinner.type === 'bomb') {
        newWinner = currentTeam === 'red' ? 'blue' : 'red';
      } else {
        newWinner = gameWinner;
      }
    }

    // Обновляем в Firebase
    const updates = {
      cards: updatedCards
    };

    // Ошиблись (нейтральная/чужая/мина) -> ход переходит сразу.
    if (card.type !== currentTeam) {
      const nextTeam = currentTeam === 'red' ? 'blue' : 'red';
      updates.currentTeam = nextTeam;
      updates.timerRunning = false;
      updates.timeLeft = 60;
      updates.guessesLeft = 0;
      updates.lastEvent = {
        id: Date.now(),
        type: 'mistake',
        message: 'Ошибка в выборе. Ход переходит сопернику.',
        team: nextTeam
      };
    } else {
      // Верно угадали слово своей команды.
      const nextGuessesLeft = Math.max(guessesLeft - 1, 0);
      updates.guessesLeft = nextGuessesLeft;

      // Угадали все слова по подсказке -> автопереход хода.
      if (nextGuessesLeft === 0) {
        const nextTeam = currentTeam === 'red' ? 'blue' : 'red';
        updates.currentTeam = nextTeam;
        updates.timerRunning = false;
        updates.timeLeft = 60;
        updates.lastEvent = {
          id: Date.now(),
          type: 'turn-end',
          message: 'Лимит угадываний исчерпан. Ход передан.',
          team: nextTeam
        };
      }
    }

    if (newWinner) {
      updates.winner = newWinner;
      updates.status = 'finished';
      updates.timerRunning = false;
      updates.guessesLeft = 0;
      updates.lastEvent = {
        id: Date.now(),
        type: 'win',
        message: `${newWinner === 'red' ? 'Красная' : 'Синяя'} команда победила!`,
        team: newWinner
      };
    }

    await update(ref(db, `rooms/${roomId}/gameState`), updates);
  };

  // Дать подсказку
  const giveHint = async (word, count) => {
    if (!roomId) return;
    await ensureAuth();

    if (!currentPlayer || !currentPlayer.isCaptain) {
      alert('Только капитан может давать подсказки!');
      return;
    }

    if (currentPlayer.team !== currentTeam) {
      alert('Сейчас ход другой команды!');
      return;
    }

    const newHint = {
      id: Date.now(),
      team: currentTeam,
      word,
      count,
      captainName: currentPlayer.name,
      timestamp: Date.now()
    };

    // Добавляем подсказку в Firebase
    await set(ref(db, `rooms/${roomId}/hints/${newHint.id}`), newHint);

    // Запускаем таймер
    await update(ref(db, `rooms/${roomId}/gameState`), {
      timeLeft: 60,
      timerRunning: true,
      guessesLeft: Number(count),
      lastEvent: {
        id: Date.now(),
        type: 'hint',
        message: `Подсказка: ${word} (${count})`,
        team: currentTeam
      }
    });
  };

  // Закончить ход
  const endTurn = async () => {
    if (!roomId) return;
    await ensureAuth();

    const nextTeam = currentTeam === 'red' ? 'blue' : 'red';
    await update(ref(db, `rooms/${roomId}/gameState`), {
      currentTeam: nextTeam,
      timerRunning: false,
      timeLeft: 60,
      guessesLeft: 0,
      lastEvent: {
        id: Date.now(),
        type: 'turn-end',
        message: 'Ход завершен игроком команды.',
        team: nextTeam
      }
    });
  };

  // Новая игра
  const resetGame = async () => {
    if (!roomId) return;
    await ensureAuth();

    await update(ref(db, `rooms/${roomId}/gameState`), {
      status: 'lobby',
      cards: [],
      currentTeam: 'red',
      winner: null,
      timeLeft: 60,
      timerRunning: false,
      guessesLeft: 0,
      rematchVotes: {},
      lastEvent: null
    });

    await set(ref(db, `rooms/${roomId}/hints`), {});

    // На новую игру капитаны подтверждают готовность заново.
    const readinessUpdates = {};
    players.forEach((p) => {
      readinessUpdates[`rooms/${roomId}/players/${p.id}/readyToStart`] = false;
    });
    if (Object.keys(readinessUpdates).length > 0) {
      await update(ref(db), readinessUpdates);
    }
  };

  // Покинуть комнату
  const leaveRoom = useCallback(() => {
    const activeRoomId = roomIdRef.current;
    const activePlayer = currentPlayerRef.current;

    if (activeRoomId && activePlayer) {
      ensureAuth();
      // Удаляем игрока из Firebase
      set(ref(db, `rooms/${activeRoomId}/players/${activePlayer.id}`), null);
    }
    
    if (activeRoomId) {
      localStorage.removeItem(getPlayerStorageKey(activeRoomId));
    }

    setRoomId(null);
    setCurrentPlayer(null);
    setSynced(false);
  }, [getPlayerStorageKey]);

  // Восстановление сессии
  useEffect(() => {
    if (!roomId || currentPlayer) return;

    const savedPlayerId = localStorage.getItem(getPlayerStorageKey(roomId));
    if (savedPlayerId) {
      const savedPlayer = players.find((p) => p.id === savedPlayerId);
      if (savedPlayer) {
        setCurrentPlayer(savedPlayer);
        return;
      }
    }

    const clientId = getClientId();
    const reconnectPlayer = players.find((p) => p.clientId === clientId);
    if (reconnectPlayer) {
      setCurrentPlayer(reconnectPlayer);
      localStorage.setItem(getPlayerStorageKey(roomId), reconnectPlayer.id);
    }
  }, [roomId, players, currentPlayer, getClientId, getPlayerStorageKey]);

  // Обновляем currentPlayer из актуального списка игроков,
  // чтобы статус команды/капитана не оставался устаревшим локально.
  useEffect(() => {
    if (!currentPlayer) return;
    const actualPlayer = players.find((p) => p.id === currentPlayer.id);
    if (actualPlayer && actualPlayer !== currentPlayer) {
      setCurrentPlayer(actualPlayer);
    }
  }, [players, currentPlayer]);

  const voteRematch = async () => {
    if (!roomId || !currentPlayer || gameState !== 'finished') return;
    await ensureAuth();

    const playerTeams = players.filter((p) => p.team === 'red' || p.team === 'blue');
    if (playerTeams.length === 0) return;

    const nextVotes = {
      ...rematchVotes,
      [currentPlayer.id]: true
    };

    await update(ref(db, `rooms/${roomId}/gameState`), {
      rematchVotes: nextVotes,
      lastEvent: {
        id: Date.now(),
        type: 'rematch-vote',
        message: `${currentPlayer.name} проголосовал за реванш`,
        team: currentPlayer.team || null
      }
    });

    const allAccepted = playerTeams.every((p) => nextVotes[p.id]);
    if (!allAccepted) return;

    const themeWords = getThemeWords(selectedTheme);
    const newCards = generateCards(themeWords);
    const firstTeam = Math.random() < 0.5 ? 'red' : 'blue';

    await set(ref(db, `rooms/${roomId}/gameState`), {
      status: 'playing',
      cards: newCards,
      currentTeam: firstTeam,
      selectedTheme,
      winner: null,
      timeLeft: 60,
      timerRunning: false,
      guessesLeft: 0,
      rematchVotes: {},
      lastEvent: {
        id: Date.now(),
        type: 'rematch-start',
        message: `Реванш стартовал. Первыми ходят ${firstTeam === 'red' ? 'красные' : 'синие'}.`,
        team: firstTeam
      },
      startedAt: Date.now()
    });

    await set(ref(db, `rooms/${roomId}/hints`), {});
  };

  const value = {
    gameState,
    players,
    currentPlayer,
    cards,
    currentTeam,
    hints,
    winner,
    selectedTheme,
    timeLeft,
    timerRunning,
    guessesLeft,
    rematchVotes,
    lastEvent,
    roomId,
    synced,
    addPlayer,
    joinTeam,
    becomeCaptain,
    startGame,
    revealCard,
    giveHint,
    endTurn,
    resetGame,
    voteRematch,
    setSelectedTheme,
    syncWithFirebase,
    leaveRoom,
    remaining: countRemaining(cards)
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

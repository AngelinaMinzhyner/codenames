import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { generateCards, checkWinner, countRemaining } from '../utils/gameLogic';
import { getThemeWords } from '../utils/themes';
import { ensureAuth } from '../utils/firebase';
import { ref, onValue, set, update, off } from 'firebase/database';
import { db } from '../utils/firebase';

const GameContext = createContext();

const EMPTY_REMAINING = { black: 0, white: 0 };

const createLobbyState = (mode = null) => ({
  status: 'lobby',
  mode
});

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame должен использоваться внутри GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState('lobby');
  const [selectedGame, setSelectedGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentTeam, setCurrentTeam] = useState('black');
  const [hints, setHints] = useState([]);
  const [winner, setWinner] = useState(null);
  const [selectedTheme, setSelectedThemeState] = useState('classic');
  const [timeLeft, setTimeLeft] = useState(30);
  const [timerRunning, setTimerRunning] = useState(false);
  const [guessesLeft, setGuessesLeft] = useState(0);
  const [lastEvent, setLastEvent] = useState(null);
  const [whoAmIAssignments, setWhoAmIAssignments] = useState({});
  const [whoAmINotes, setWhoAmINotes] = useState({});
  
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

  const resetCodenamesState = useCallback(() => {
    setCards([]);
    setCurrentTeam('black');
    setHints([]);
    setWinner(null);
    setTimeLeft(30);
    setTimerRunning(false);
    setGuessesLeft(0);
    setLastEvent(null);
  }, []);

  const resetWhoAmIState = useCallback(() => {
    setWhoAmIAssignments({});
    setWhoAmINotes({});
  }, []);

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

      const activeGame = roomData.selectedGame || roomData.gameState?.mode || null;
      setSelectedGame(activeGame);

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

        if (activeGame === 'codenames') {
          setCards(gs.cards || []);
          setCurrentTeam(gs.currentTeam || 'black');
          if (gs.selectedTheme) {
            setSelectedThemeState(gs.selectedTheme);
          }
          setWinner(gs.winner || null);
          setTimeLeft(gs.timeLeft ?? 30);
          setTimerRunning(Boolean(gs.timerRunning));
          setGuessesLeft(gs.guessesLeft ?? 0);
          setLastEvent(gs.lastEvent || null);
          resetWhoAmIState();
        } else if (activeGame === 'whoami') {
          setWhoAmIAssignments(gs.assignments || {});
          setWhoAmINotes(gs.notes || {});
          setLastEvent(gs.lastEvent || null);
          resetCodenamesState();
        } else {
          resetCodenamesState();
          resetWhoAmIState();
        }
      } else {
        setGameState('lobby');
        setLastEvent(null);
        resetCodenamesState();
        resetWhoAmIState();
      }

      // Синхронизируем тему для лобби (если игра еще не запущена)
      if (roomData.selectedTheme) {
        setSelectedThemeState(roomData.selectedTheme);
      }

      // Синхронизируем подсказки
      if (activeGame === 'codenames' && roomData.hints) {
        const hintsList = Object.values(roomData.hints).sort((a, b) => b.id - a.id);
        setHints(hintsList);
      } else {
        setHints([]);
      }
      setSynced(true);
    }, (error) => {
      console.error('Room sync error:', error);
      setSynced(false);
    });

    return () => {
      off(roomRef);
    };
  }, [resetCodenamesState, resetWhoAmIState]);

  // Таймер
  useEffect(() => {
    let interval;
    if (selectedGame === 'codenames' && timerRunning && timeLeft > 0 && roomId) {
      ensureAuth().catch(() => null);
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setTimerRunning(false);
            const nextTeam = currentTeam === 'black' ? 'white' : 'black';
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
  }, [selectedGame, timerRunning, timeLeft, roomId, currentTeam]);

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

    if (selectedGame !== 'codenames') {
      return;
    }

    const blackTeam = players.filter(p => p.team === 'black');
    const whiteTeam = players.filter(p => p.team === 'white');
    
    if (blackTeam.length === 0 || whiteTeam.length === 0) {
      alert('Обе команды должны иметь хотя бы одного игрока!');
      return;
    }

    const blackCaptain = blackTeam.find(p => p.isCaptain);
    const whiteCaptain = whiteTeam.find(p => p.isCaptain);

    if (!blackCaptain || !whiteCaptain) {
      alert('В каждой команде должен быть капитан!');
      return;
    }

    if (!currentPlayer || !currentPlayer.isCaptain) {
      alert('Только капитаны могут подтверждать старт игры.');
      return;
    }

    await update(ref(db, `rooms/${roomId}/players/${currentPlayer.id}`), {
      readyToStart: true
    });

    const blackReady = blackCaptain.readyToStart || blackCaptain.id === currentPlayer.id;
    const whiteReady = whiteCaptain.readyToStart || whiteCaptain.id === currentPlayer.id;

    if (!blackReady || !whiteReady) {
      alert('Готовность принята. Ожидаем подтверждение второго капитана.');
      return;
    }

    const themeWords = getThemeWords(selectedTheme);
    const newCards = generateCards(themeWords);
    const firstTeam = Math.random() < 0.5 ? 'black' : 'white';

    await set(ref(db, `rooms/${roomId}/gameState`), {
      status: 'playing',
      mode: 'codenames',
      cards: newCards,
      currentTeam: firstTeam,
      selectedTheme,
      winner: null,
      timeLeft: 30,
      timerRunning: false,
      guessesLeft: 0,
      lastEvent: {
        id: Date.now(),
        type: 'start',
        message: `Игра началась. Первыми ходят ${firstTeam === 'black' ? 'чёрные' : 'белые'}.`,
        team: firstTeam
      },
      startedAt: Date.now()
    });

    await update(ref(db, `rooms/${roomId}`), {
      status: 'playing'
    });

    // Очищаем подсказки
    await set(ref(db, `rooms/${roomId}/hints`), {});
  };

  const startWhoAmIGame = async () => {
    if (!roomId) return;
    await ensureAuth();

    if (selectedGame !== 'whoami') {
      return;
    }

    if (!currentPlayer) {
      alert('Сначала войдите в комнату.');
      return;
    }

    if (players.length < 2) {
      alert('Для игры "Кто я" нужно минимум 2 игрока.');
      return;
    }

    await set(ref(db, `rooms/${roomId}/gameState`), {
      status: 'playing',
      mode: 'whoami',
      assignments: {},
      notes: {},
      lastEvent: {
        id: Date.now(),
        type: 'start',
        message: 'Игра "Кто я" началась. Распределяйте слова по игрокам.',
      },
      startedAt: Date.now()
    });

    await update(ref(db, `rooms/${roomId}`), {
      status: 'playing'
    });
  };

  const selectGame = async (gameId) => {
    if (!roomId) return;
    await ensureAuth();

    await update(ref(db, `rooms/${roomId}`), {
      selectedGame: gameId,
      status: 'waiting',
      gameState: createLobbyState(gameId)
    });

    await set(ref(db, `rooms/${roomId}/hints`), {});
  };

  // Выбрать тему в лобби (синхронизировано для всех игроков)
  const selectTheme = async (themeId) => {
    if (!roomId) return;
    await ensureAuth();

    setSelectedThemeState(themeId);
    await update(ref(db, `rooms/${roomId}`), {
      selectedTheme: themeId
    });
  };

  // Открыть карту
  const revealCard = async (cardId) => {
    if (!roomId || gameState !== 'playing' || selectedGame !== 'codenames') return;
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

    const selectedWord = card.word;
    // Нейтральная карта остаётся на поле как пустое место (reserved), не удаляем
    const updatedCards = cards.map((c) => (c.id === cardId ? { ...c, revealed: true } : c));

    // Проверяем победу
    const gameWinner = checkWinner(updatedCards);
    let newWinner = null;

    if (gameWinner) {
      if (gameWinner.type === 'bomb') {
        newWinner = currentTeam === 'black' ? 'white' : 'black';
      } else {
        newWinner = gameWinner;
      }
    }

    // Обновляем в Firebase
    const updates = {
      cards: updatedCards,
      lastEvent: {
        id: Date.now(),
        type: card.type === 'neutral' ? 'neutral' : 'pick',
        message: card.type === 'neutral'
          ? `Выбрано: ${selectedWord}. Нейтральная карта открыта.`
          : `Выбрано: ${selectedWord}`,
        team: currentTeam
      }
    };

    // Ошиблись (нейтральная/чужая/мина) -> ход переходит сразу.
    if (card.type !== currentTeam) {
      const nextTeam = currentTeam === 'black' ? 'white' : 'black';
      updates.currentTeam = nextTeam;
      updates.timerRunning = false;
      updates.timeLeft = 30;
      updates.guessesLeft = 0;
      updates.lastEvent = {
        id: Date.now(),
        type: 'mistake',
        message: `Выбрано: ${selectedWord}. Ход переходит сопернику.`,
        team: nextTeam
      };
    } else {
      // Верно угадали слово своей команды.
      const nextGuessesLeft = Math.max(guessesLeft - 1, 0);
      updates.guessesLeft = nextGuessesLeft;

      // Угадали все слова по подсказке -> автопереход хода.
      if (nextGuessesLeft === 0) {
        const nextTeam = currentTeam === 'black' ? 'white' : 'black';
        updates.currentTeam = nextTeam;
        updates.timerRunning = false;
        updates.timeLeft = 30;
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
      updates.cards = updatedCards.map((c) => ({ ...c, revealed: true }));
      updates.lastEvent = {
        id: Date.now(),
        type: 'win',
        message: `${newWinner === 'black' ? 'Черная' : 'Белая'} команда победила!`,
        team: newWinner
      };
    }

    await update(ref(db, `rooms/${roomId}/gameState`), updates);
  };

  // Дать подсказку
  const giveHint = async (word, count) => {
    if (!roomId || selectedGame !== 'codenames') return;
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
      timeLeft: 30,
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
    if (!roomId || selectedGame !== 'codenames') return;
    await ensureAuth();

    const nextTeam = currentTeam === 'black' ? 'white' : 'black';
    await update(ref(db, `rooms/${roomId}/gameState`), {
      currentTeam: nextTeam,
      timerRunning: false,
      timeLeft: 30,
      guessesLeft: 0,
      lastEvent: {
        id: Date.now(),
        type: 'turn-end',
        message: 'Ход завершен игроком команды.',
        team: nextTeam
      }
    });
  };

  const assignWhoAmIWord = async (targetPlayerId, word) => {
    if (!roomId || selectedGame !== 'whoami') return;
    await ensureAuth();

    if (!currentPlayer) {
      alert('Сначала войдите в комнату.');
      return;
    }

    if (currentPlayer.id === targetPlayerId) {
      alert('Нельзя назначать слово самому себе.');
      return;
    }

    const cleanWord = word.trim();
    await set(
      ref(db, `rooms/${roomId}/gameState/assignments/${targetPlayerId}`),
      cleanWord
        ? {
            word: cleanWord,
            updatedBy: currentPlayer.id,
            updatedByName: currentPlayer.name,
            updatedAt: Date.now()
          }
        : null
    );
  };

  const updateWhoAmINote = async (note) => {
    if (!roomId || selectedGame !== 'whoami') return;
    await ensureAuth();

    if (!currentPlayer) {
      alert('Сначала войдите в комнату.');
      return;
    }

    await set(ref(db, `rooms/${roomId}/gameState/notes/${currentPlayer.id}`), {
      text: note,
      updatedAt: Date.now()
    });
  };

  // Новая игра
  const resetGame = async () => {
    if (!roomId) return;
    await ensureAuth();

    if (selectedGame === 'codenames') {
      await set(ref(db, `rooms/${roomId}/gameState`), {
        status: 'lobby',
        mode: 'codenames',
        cards: [],
        currentTeam: 'black',
        winner: null,
        timeLeft: 30,
        timerRunning: false,
        guessesLeft: 0,
        lastEvent: null,
        selectedTheme
      });

      const readinessUpdates = {};
      players.forEach((p) => {
        readinessUpdates[`rooms/${roomId}/players/${p.id}/readyToStart`] = false;
      });
      if (Object.keys(readinessUpdates).length > 0) {
        await update(ref(db), readinessUpdates);
      }
    } else {
      await set(ref(db, `rooms/${roomId}/gameState`), createLobbyState(selectedGame));
    }

    await set(ref(db, `rooms/${roomId}/hints`), {});

    await update(ref(db, `rooms/${roomId}`), {
      status: 'waiting'
    });
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
    setSelectedGame(null);
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

  const value = {
    gameState,
    selectedGame,
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
    lastEvent,
    whoAmIAssignments,
    whoAmINotes,
    roomId,
    synced,
    addPlayer,
    joinTeam,
    becomeCaptain,
    startGame,
    startWhoAmIGame,
    revealCard,
    giveHint,
    endTurn,
    resetGame,
    selectGame,
    selectTheme,
    assignWhoAmIWord,
    updateWhoAmINote,
    syncWithFirebase,
    leaveRoom,
    remaining: selectedGame === 'codenames' ? countRemaining(cards) : EMPTY_REMAINING
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { generateCards, checkWinner, countRemaining } from '../utils/gameLogic';
import { getThemeWords } from '../utils/themes';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame должен использоваться внутри GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'playing', 'finished'
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentTeam, setCurrentTeam] = useState('red');
  const [hints, setHints] = useState([]);
  const [winner, setWinner] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('classic');
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);

  // Таймер для отгадывания
  useEffect(() => {
    let interval;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  // Добавить игрока
  const addPlayer = (name) => {
    const newPlayer = {
      id: Date.now(),
      name,
      team: null,
      isCaptain: false
    };
    setPlayers([...players, newPlayer]);
    setCurrentPlayer(newPlayer);
    return newPlayer;
  };

  // Выбрать команду
  const joinTeam = (playerId, team) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, team } : p
    ));
  };

  // Стать капитаном
  const becomeCaptain = (playerId, team) => {
    setPlayers(players.map(p => ({
      ...p,
      isCaptain: p.id === playerId && p.team === team
        ? true
        : p.team === team && p.isCaptain
        ? false
        : p.isCaptain
    })));
  };

  // Начать игру
  const startGame = () => {
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

    const themeWords = getThemeWords(selectedTheme);
    setCards(generateCards(themeWords));
    setGameState('playing');
    setCurrentTeam('red');
    setHints([]);
    setWinner(null);
    setTimeLeft(60);
    setTimerRunning(false);
  };

  // Открыть карту
  const revealCard = (cardId) => {
    if (gameState !== 'playing') return;
    
    const card = cards.find(c => c.id === cardId);
    if (!card || card.revealed) return;

    // Проверяем что игрок не капитан
    if (currentPlayer && currentPlayer.isCaptain) {
      alert('Капитан не может открывать карты!');
      return;
    }

    // Проверяем что игрок из текущей команды
    if (currentPlayer && currentPlayer.team !== currentTeam) {
      alert('Сейчас ход другой команды!');
      return;
    }

    const updatedCards = cards.map(c =>
      c.id === cardId ? { ...c, revealed: true } : c
    );
    setCards(updatedCards);

    // Проверяем победу
    const gameWinner = checkWinner(updatedCards);
    if (gameWinner) {
      if (gameWinner.type === 'bomb') {
        // Команда попала на бомбу
        setWinner(currentTeam === 'red' ? 'blue' : 'red');
      } else {
        setWinner(gameWinner);
      }
      setGameState('finished');
      return;
    }

    // Если угадали не свою карту - переход хода
    if (card.type !== currentTeam) {
      setCurrentTeam(currentTeam === 'red' ? 'blue' : 'red');
    }
  };

  // Дать подсказку
  const giveHint = (word, count) => {
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
      captainName: currentPlayer.name
    };

    setHints([newHint, ...hints]);
    setTimeLeft(60);
    setTimerRunning(true);
  };

  // Закончить ход
  const endTurn = () => {
    setCurrentTeam(currentTeam === 'red' ? 'blue' : 'red');
    setTimerRunning(false);
  };

  // Новая игра
  const resetGame = () => {
    setGameState('lobby');
    setCards([]);
    setCurrentTeam('red');
    setHints([]);
    setWinner(null);
    setTimeLeft(60);
    setTimerRunning(false);
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
    addPlayer,
    joinTeam,
    becomeCaptain,
    startGame,
    revealCard,
    giveHint,
    endTurn,
    resetGame,
    setSelectedTheme,
    remaining: countRemaining(cards)
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RoomService } from '../utils/firebase';
import Lobby from './Lobby';
import Game from './Game';
import { useGame } from '../context/GameContext';

const RoomWrapper = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { gameState, syncWithFirebase, leaveRoom } = useGame();
  const [roomExists, setRoomExists] = useState(true);
  const [roomCode, setRoomCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    let unsubscribeRoom;
    let isMounted = true;

    // Инициализируем синхронизацию с Firebase для этой комнаты
    Promise.resolve(syncWithFirebase(roomId)).then((unsubscribe) => {
      if (!isMounted) return;
      unsubscribeRoom = unsubscribe;
    });

    // Проверяем существование комнаты
    const unsubscribeExistence = RoomService.getRoom(roomId, (roomData) => {
      if (!roomData) {
        setRoomExists(false);
      }
    });

    // Генерируем короткий код для отображения
    setRoomCode(roomId.slice(-8).toUpperCase());

    // При обычном размонтировании не удаляем игрока,
    // чтобы reconnect после refresh работал корректно.
    return () => {
      isMounted = false;
      if (typeof unsubscribeRoom === 'function') unsubscribeRoom();
      if (typeof unsubscribeExistence === 'function') unsubscribeExistence();
    };
  }, [roomId, syncWithFirebase, navigate]);

  const copyRoomCode = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Вы уверены что хотите покинуть комнату?')) {
      leaveRoom();
      navigate('/');
    }
  };

  if (!roomExists) {
    return (
      <div className="room-not-found">
        <div className="error-container">
          <h1>❌ Комната не найдена</h1>
          <p>Комната с кодом <strong>{roomId}</strong> не существует или была удалена.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="room-wrapper">
      <div className="room-header">
        <div className="room-code-display">
          <span className="label">Код комнаты:</span>
          <span className="code">{roomCode}</span>
          <button 
            className={`btn-copy ${copied ? 'copied' : ''}`}
            onClick={copyRoomCode}
            title="Скопировать ссылку"
          >
            {copied ? '✓ Скопировано' : '📋 Копировать ссылку'}
          </button>
        </div>
        <button className="btn-leave" onClick={handleLeaveRoom}>
          ← Покинуть комнату
        </button>
      </div>

      {gameState === 'lobby' ? <Lobby /> : <Game />}
    </div>
  );
};

export default RoomWrapper;

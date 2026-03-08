import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomService } from '../utils/firebase';

const RoomSelector = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [activeRooms, setActiveRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Подписываемся на список активных комнат
    const unsubscribe = RoomService.getRoomsList((rooms) => {
      // Фильтруем комнаты младше 2 часов
      const recentRooms = rooms.filter(room => {
        const roomAge = Date.now() - room.createdAt;
        return roomAge < 2 * 60 * 60 * 1000; // 2 часа
      });
      setActiveRooms(recentRooms);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const createRoom = async () => {
    setLoading(true);
    try {
      const roomId = await RoomService.createRoom({
        status: 'waiting',
        players: {},
        gameState: null,
        createdAt: Date.now()
      });
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error('Ошибка создания комнаты:', error);
      alert(`Не удалось создать комнату. ${error?.message || 'Проверьте Firebase настройки и Rules.'}`);
    }
    setLoading(false);
  };

  const joinRoom = () => {
    if (roomCode.trim()) {
      navigate(`/room/${roomCode.trim()}`);
    }
  };

  const joinExistingRoom = (roomId) => {
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="room-selector">
      <div className="room-selector-container">
        <h1>🎮 CodeNames Online</h1>
        <p className="subtitle">Выберите или создайте комнату для игры</p>

        <div className="room-actions">
          <div className="action-card">
            <h2>Создать новую комнату</h2>
            <p>Создайте приватную комнату и пригласите друзей</p>
            <button 
              className="btn btn-large btn-primary" 
              onClick={createRoom}
              disabled={loading}
            >
              {loading ? 'Создание...' : '+ Создать комнату'}
            </button>
          </div>

          <div className="divider">ИЛИ</div>

          <div className="action-card">
            <h2>Присоединиться к комнате</h2>
            <p>Введите код комнаты от друга</p>
            <div className="join-form">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Введите код комнаты..."
                maxLength={15}
                onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
              />
              <button 
                className="btn btn-primary" 
                onClick={joinRoom}
                disabled={!roomCode.trim()}
              >
                Войти
              </button>
            </div>
          </div>
        </div>

        {activeRooms.length > 0 && (
          <div className="active-rooms">
            <h3>🎯 Активные комнаты ({activeRooms.length})</h3>
            <div className="rooms-list">
              {activeRooms.map(room => (
                <div key={room.id} className="room-item">
                  <div className="room-info">
                    <div className="room-id">Комната: {room.id.slice(-8)}</div>
                    <div className="room-players">
                      👥 Игроков: {Object.keys(room.players || {}).length}
                    </div>
                    <div className="room-status">
                      {room.status === 'waiting' ? '⏳ Ожидание' : '🎮 Игра идёт'}
                    </div>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={() => joinExistingRoom(room.id)}
                  >
                    Войти
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="room-info-section">
          <h3>ℹ️ Как играть?</h3>
          <ol>
            <li>Создайте комнату или присоединитесь к существующей</li>
            <li>Поделитесь кодом комнаты с друзьями</li>
            <li>Разделитесь на 2 команды и выберите капитанов</li>
            <li>Начните игру и веселитесь!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default RoomSelector;

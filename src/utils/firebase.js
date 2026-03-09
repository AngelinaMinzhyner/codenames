import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update, remove } from 'firebase/database';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Конфигурация Firebase
// Замените на вашу конфигурацию
const firebaseConfig = {
  apiKey: "AIzaSyBEZTAKbTR8TorgPj0nrAoP_yrsqrqPFyQ",
  authDomain: "codenames-c2c89.firebaseapp.com",
  databaseURL: "https://codenames-c2c89-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "codenames-c2c89",
  storageBucket: "codenames-c2c89.firebasestorage.app",
  messagingSenderId: "292013257737",
  appId: "1:292013257737:web:78a37b71a339a24cac34d8",
  measurementId: "G-L3W07V2MB5"
};

// Инициализация Firebase
let app;
let db;
let auth;

try {
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  auth = getAuth(app);
} catch (error) {
  console.log('Firebase не инициализирован:', error.message);
}

export { db };

export async function ensureAuth() {
  if (!auth) return;
  if (auth.currentUser) return;
  await signInAnonymously(auth);
}

function mapFirebaseError(error) {
  const message = typeof error?.message === 'string' ? error.message : '';
  const code = error?.code || '';

  if (message.includes('PERMISSION_DENIED') || code.includes('permission-denied')) {
    return new Error(
      'PERMISSION_DENIED: Проверьте Realtime Database Rules. Для теста установите read/write для /rooms или включите anonymous auth в Firebase Authentication.'
    );
  }

  if (code === 'auth/operation-not-allowed') {
    return new Error(
      'Anonymous Auth отключен. Включите Firebase Authentication -> Sign-in method -> Anonymous.'
    );
  }

  return error;
}

// Функции для работы с комнатами
export const RoomService = {
  // Создать новую комнату
  createRoom: async (roomData) => {
    if (!db) return Promise.reject('Firebase не инициализирован');
    await ensureAuth();
    const roomId = Date.now().toString();
    try {
      await set(ref(db, `rooms/${roomId}`), {
        id: roomId,
        createdAt: Date.now(),
        ...roomData
      });
      return roomId;
    } catch (error) {
      throw mapFirebaseError(error);
    }
  },

  // Получить комнату
  getRoom: (roomId, callback) => {
    if (!db) return;
    const roomRef = ref(db, `rooms/${roomId}`);
    return onValue(roomRef, (snapshot) => {
      callback(snapshot.val());
    });
  },

  // Обновить комнату
  updateRoom: async (roomId, data) => {
    if (!db) return Promise.reject('Firebase не инициализирован');
    await ensureAuth();
    try {
      return await update(ref(db, `rooms/${roomId}`), data);
    } catch (error) {
      throw mapFirebaseError(error);
    }
  },

  // Удалить комнату
  deleteRoom: async (roomId) => {
    if (!db) return Promise.reject('Firebase не инициализирован');
    await ensureAuth();
    try {
      return await remove(ref(db, `rooms/${roomId}`));
    } catch (error) {
      throw mapFirebaseError(error);
    }
  },

  // Получить все активные комнаты
  getRoomsList: (callback) => {
    if (!db) return;
    const roomsRef = ref(db, 'rooms');
    return onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      const roomsList = data ? Object.values(data) : [];
      callback(roomsList);
    });
  }
};

// Функции для работы с игровым состоянием
export const GameService = {
  // Публикация состояния игры
  publishGameState: async (roomId, gameState) => {
    if (!db) return Promise.reject('Firebase не инициализирован');
    await ensureAuth();
    try {
      return await set(ref(db, `rooms/${roomId}/gameState`), gameState);
    } catch (error) {
      throw mapFirebaseError(error);
    }
  },

  // Подписка на обновления состояния игры
  subscribeToGameState: (roomId, callback) => {
    if (!db) return;
    const stateRef = ref(db, `rooms/${roomId}/gameState`);
    return onValue(stateRef, (snapshot) => {
      callback(snapshot.val());
    });
  },

  // Публикация подсказки
  publishHint: async (roomId, hint) => {
    if (!db) return Promise.reject('Firebase не инициализирован');
    await ensureAuth();
    const hintId = Date.now().toString();
    try {
      return await set(ref(db, `rooms/${roomId}/hints/${hintId}`), hint);
    } catch (error) {
      throw mapFirebaseError(error);
    }
  }
};

const FirebaseServices = { RoomService, GameService };

export default FirebaseServices;

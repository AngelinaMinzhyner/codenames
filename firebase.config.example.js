// ========================================
// ПРИМЕР Firebase конфигурации
// ========================================
// 
// Этот файл показывает РЕАЛЬНЫЙ пример того,
// как выглядит конфигурация Firebase после создания проекта
//
// НЕ ИСПОЛЬЗУЙТЕ эти значения! Создайте свой проект.
// ========================================

const firebaseConfigExample = {
  // API ключ - находится в Project Settings
  // НЕ секретный! Можно публиковать
  apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuvwx",
  
  // Домен авторизации - автоматически создается
  // Формат: название-проекта.firebaseapp.com
  authDomain: "codenames-game-a1b2c.firebaseapp.com",
  
  // URL базы данных Realtime Database
  // ВАЖНО: Может НЕ быть в начальной конфигурации!
  // Скопируйте из Realtime Database (вверху страницы)
  databaseURL: "https://codenames-game-a1b2c-default-rtdb.europe-west1.firebasedatabase.app",
  
  // ID проекта - уникальное имя проекта
  projectId: "codenames-game-a1b2c",
  
  // Хранилище файлов
  storageBucket: "codenames-game-a1b2c.appspot.com",
  
  // ID отправителя для Cloud Messaging
  messagingSenderId: "123456789012",
  
  // ID приложения
  appId: "1:123456789012:web:abcdef1234567890abcdef",
  
  // Опционально: ID для аналитики
  // measurementId: "G-XXXXXXXXXX"
};

// ========================================
// ГДЕ НАЙТИ КАЖДЫЙ ПАРАМЕТР:
// ========================================

/*

1. apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId:
   
   Firebase Console → Settings ⚙️ → Project settings → 
   Прокрутить вниз до "Your apps" → 
   Выбрать веб-приложение → SDK setup and configuration

2. databaseURL:
   
   Firebase Console → Realtime Database → 
   Вверху страницы будет URL вида:
   https://ваш-проект-default-rtdb.firebaseio.com
   или
   https://ваш-проект-default-rtdb.REGION.firebasedatabase.app

   ВАЖНО: Если база в не-US регионе, URL будет содержать регион!

3. Полная конфигурация одним местом:
   
   Settings ⚙️ → Project settings → General → 
   Your apps → Web apps → Config

*/

// ========================================
// РЕГИОНАЛЬНЫЕ РАЗЛИЧИЯ databaseURL:
// ========================================

// US (по умолчанию):
// https://project-name-default-rtdb.firebaseio.com

// Europe West:
// https://project-name-default-rtdb.europe-west1.firebasedatabase.app

// Asia Southeast:
// https://project-name-default-rtdb.asia-southeast1.firebasedatabase.app

// ========================================
// КАК ИСПОЛЬЗОВАТЬ:
// ========================================

/*

1. Создайте проект на https://console.firebase.google.com/
2. Включите Realtime Database
3. Скопируйте ВСЮ конфигурацию из Project Settings
4. Откройте src/utils/firebase.js
5. Замените firebaseConfig на ВАШУ конфигурацию
6. Сохраните файл
7. npm start

*/

// ========================================
// БЕЗОПАСНОСТЬ:
// ========================================

/*

- apiKey МОЖНО публиковать на GitHub
- Безопасность = Firebase Security Rules
- Test Mode = открытый доступ 30 дней
- Production = настройте Rules:

{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": "auth != null"  // только авторизованные
      }
    }
  }
}

*/

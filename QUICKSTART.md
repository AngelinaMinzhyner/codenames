# 🚀 Быстрый старт - Firebase настройка за 5 минут

## Вариант А: Простой (для начала) ⭐ РЕКОМЕНДУЕТСЯ

### 1. Создайте Firebase проект
- Откройте: https://console.firebase.google.com/
- **Add project** → введите `codenames-game` → **Create**

### 2. Включите Realtime Database
- Меню слева: **Realtime Database**
- **Create Database** → регион: **Europe** или **US**
- **Start in test mode** → **Enable**

### 3. Получите конфигурацию
- Нажмите **⚙️ Settings** → **Project settings**
- Прокрутите вниз до **"Your apps"**
- Нажмите на веб-иконку **</>**
- Введите название: `CodeNames Web` → **Register app**
- **СКОПИРУЙТЕ** весь блок `firebaseConfig`

### 4. Вставьте в код
Откройте: `src/utils/firebase.js` (строки 6-13)

**Замените:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDemoKey123456789",
  authDomain: "codenames-demo.firebaseapp.com",
  // ... остальное
```

**На ваше:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyВАШ_КЛЮЧ_ИЗ_FIREBASE",
  authDomain: "ваш-проект.firebaseapp.com",
  // ... вставьте все что скопировали
```

### 5. Добавьте databaseURL
В `firebaseConfig` обязательно добавьте:
```javascript
databaseURL: "https://ваш-проект-default-rtdb.firebaseio.com"
```

**Где взять?** → Realtime Database → URL вверху страницы

### 6. Запустите!
```bash
npm install
npm start
```

---

## Вариант Б: Продвинутый (безопаснее)

### 1-3. Такие же как в Варианте А

### 4. Создайте файл .env.local
В корне проекта создайте файл `.env.local`:

```env
REACT_APP_FIREBASE_API_KEY=ваш_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=ваш-проект.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=ваш-проект
REACT_APP_FIREBASE_STORAGE_BUCKET=ваш-проект.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_DATABASE_URL=https://ваш-проект-default-rtdb.firebaseio.com
REACT_APP_FIREBASE_APP_ID=1:123456:web:abcdef
```

### 5. Обновите firebase.js
Замените hardcoded конфигурацию на:

```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

### 6. Запустите!
```bash
npm install
npm start
```

---

## 🔍 Где найти параметры - Шпаргалка

| Что ищем | Где найти |
|----------|-----------|
| **Всю конфигурацию** | ⚙️ Settings → Project settings → Your apps → Config |
| **databaseURL** | Realtime Database → URL в верхней части |
| **apiKey** | Project settings → General → Web API Key |

---

## ✅ Проверка что всё работает

После запуска `npm start`:

1. Откройте консоль браузера (F12)
2. Не должно быть ошибок Firebase
3. Если видите "Firebase не инициализирован" - проверьте конфигурацию
4. Если "Permission denied" - включите test mode в Realtime Database Rules

---

## 🎯 Следующие шаги

После успешного запуска:

1. **Протестируйте локально** - создайте игру, проверьте функционал
2. **Настройте правила** - Realtime Database → Rules (для production)
3. **Деплой** - Firebase Hosting или Vercel/Netlify

---

## ❓ Частые проблемы

### "Firebase not initialized"
→ Проверьте что все параметры правильно скопированы в `firebase.js`

### "Permission denied"
→ Realtime Database → Rules → Start in test mode или настройте правила

### "databaseURL is undefined"
→ Добавьте databaseURL вручную из Realtime Database (URL вверху)

### После изменения .env не работает
→ Перезапустите `npm start` (React не перезагружает .env на лету)

---

💡 **Совет**: Начните с Варианта А (проще), потом переходите на Вариант Б (безопаснее для production)

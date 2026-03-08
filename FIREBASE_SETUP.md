# 🔥 Firebase Setup - Быстрая инструкция

## 1️⃣ Создайте проект

**Firebase Console**: https://console.firebase.google.com/

1. Войдите с Google аккаунтом
2. **"Add project"** → введите название → **"Create project"**

## 2️⃣ Включите Realtime Database

1. Меню слева → **"Build"** → **"Realtime Database"**
2. **"Create Database"** → выберите регион
3. **"Start in test mode"** → **"Enable"**

## 3️⃣ Получите конфигурацию

1. **Settings** ⚙️ (слева вверху) → **"Project settings"**
2. Прокрутите вниз до **"Your apps"**
3. Нажмите на веб-иконку **</>**
4. Введите название → Register app
5. **Скопируйте firebaseConfig**

## 4️⃣ Найдите databaseURL

1. **"Realtime Database"** (меню слева)
2. Вверху страницы скопируйте URL:
   ```
   https://ваш-проект-default-rtdb.firebaseio.com
   ```

## 5️⃣ Вставьте в код

Откройте: `src/utils/firebase.js`

Замените:
```javascript
const firebaseConfig = {
  apiKey: "ВАШ_API_KEY",
  authDomain: "ваш-проект.firebaseapp.com",
  projectId: "ваш-проект",
  storageBucket: "ваш-проект.appspot.com",
  messagingSenderId: "ваш-sender-id",
  databaseURL: "https://ваш-проект-default-rtdb.firebaseio.com",
  appId: "ваш-app-id"
};
```

## ✅ Запустите

```bash
npm install
npm start
```

## 📍 Шпаргалка: Где что найти

### apiKey, projectId, appId
→ Settings ⚙️ → Project settings → Your apps (в середине страницы)

### databaseURL
→ Realtime Database → URL вверху страницы

### Все параметры сразу
→ Settings ⚙️ → Project settings → Your apps → SDK setup and configuration

## 🔒 Безопасность (для production)

**Realtime Database** → **Rules**:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

⚠️ **Test mode** дает доступ всем на 30 дней!

## ❓ Проблемы?

### Error: Firebase не инициализирован
→ Проверьте что все параметры скопированы правильно

### Permission denied
→ Включите test mode в Rules или настройте правила доступа

### databaseURL undefined
→ Добавьте вручную из Realtime Database (URL вверху)

---

💡 **Совет**: Можно использовать бесплатный план Firebase для тестирования!

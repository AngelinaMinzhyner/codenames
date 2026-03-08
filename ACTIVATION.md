# 🎮 CodeNames - АКТИВАЦИЯ МУЛЬТИПЛЕЕРА

## ✅ Что было сделано:

Создан полноценный онлайн мультиплеер с:
- ✅ Системой комнат (каждая игра = отдельная комната)
- ✅ Реал-тайм синхронизацией через Firebase
- ✅ Ссылками для приглашения друзей
- ✅ Списком активных комнат
- ✅ Автоматической синхронизацией всех действий

---

## 🚀 ЧТО НУЖНО СДЕЛАТЬ СЕЙЧАС:

### Шаг 1: Откройте терминал в папке проекта

Windows:
```powershell
cd d:\dev\codenames
```

### Шаг 2: Скопируйте и выполните команды

**Windows PowerShell:**
```powershell
cd src
Move-Item App.js App.old.js
Move-Item context\GameContext.js context\GameContext.old.js
Move-Item AppNew.js App.js
Move-Item context\GameContextNew.js context\GameContext.js
cd ..
npm install
npm start
```

**macOS/Linux:**
```bash
cd src
mv App.js App.old.js
mv context/GameContext.js context/GameContext.old.js
mv AppNew.js App.js
mv context/GameContextNew.js context/GameContext.js
cd ..
npm install
npm start
```

### Шаг 3: Готово! 🎉

Приложение откроется на `http://localhost:3000`

---

## 🎯 Что вы увидите:

1. **Главная страница** с кнопкой "Создать комнату"
2. Нажмите "Создать комнату"
3. Откроется страница с **кодом комнаты** вверху
4. Нажмите **"📋 Копировать ссылку"**
5. Откройте ссылку **в новой вкладке** или отправьте другу
6. Оба игрока видят друг друга в реальном времени! ✨

---

## 📚 Подробная документация:

- **START_HERE.md** - полная инструкция
- **COMMANDS.md** - все команды одним файлом
- **MIGRATION.md** - детали миграции
- **README.md** - документация проекта

---

## ❓ Нужна помощь?

Если что-то пошло не так - откройте [START_HERE.md](START_HERE.md) для решения проблем.

---

**Просто скопируйте команды выше и запустите!** 🚀

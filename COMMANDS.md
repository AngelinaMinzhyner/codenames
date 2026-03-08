# ⚡ БЫСТРЫЕ КОМАНДЫ - Скопируй и вставь!

## 🎯 Миграция на мультиплеер (Windows PowerShell):

```powershell
# Перейти в папку проекта
cd d:\dev\codenames

# Перейти в src
cd src

# Создать бэкапы старых файлов
Move-Item App.js App.old.js
Move-Item context\GameContext.js context\GameContext.old.js

# Переименовать новые файлы
Move-Item AppNew.js App.js
Move-Item context\GameContextNew.js context\GameContext.js

# Вернуться в корень
cd ..

# Установить зависимости
npm install

# Запустить
npm start
```

---

## 🎯 Миграция на мультиплеер (macOS/Linux):

```bash
# Перейти в папку проекта
cd ~/dev/codenames     # или ваш путь

# Перейти в src
cd src

# Создать бэкапы старых файлов
mv App.js App.old.js
mv context/GameContext.js context/GameContext.old.js

# Переименовать новые файлы
mv AppNew.js App.js
mv context/GameContextNew.js context/GameContext.js

# Вернуться в корень
cd ..

# Установить зависимости
npm install

# Запустить
npm start
```

---

## 🔙 Откат к старой версии (если что-то пошло не так):

### Windows PowerShell:
```powershell
cd d:\dev\codenames\src

# Откатить изменения
Move-Item App.js AppNew.js -Force
Move-Item App.old.js App.js -Force
Move-Item context\GameContext.js context\GameContextNew.js -Force
Move-Item context\GameContext.old.js context\GameContext.js -Force

cd ..
npm start
```

### macOS/Linux:
```bash
cd ~/dev/codenames/src

# Откатить изменения
mv App.js AppNew.js
mv App.old.js App.js
mv context/GameContext.js context/GameContextNew.js
mv context/GameContext.old.js context/GameContext.js

cd ..
npm start
```

---

## 📊 Проверка статуса файлов:

### Windows:
```powershell
# Проверить какие файлы есть
Get-ChildItem src\App*.js
Get-ChildItem src\context\GameContext*.js

# Должно показать:
# App.js (новый)
# App.old.js (старый бэкап)
# GameContext.js (новый)
# GameContext.old.js (старый бэкап)
```

### macOS/Linux:
```bash
# Проверить какие файлы есть
ls src/App*.js
ls src/context/GameContext*.js

# Должно показать:
# App.js (новый)
# App.old.js (старый бэкап)
# GameContext.js (новый)
# GameContext.old.js (старый бэкап)
```

---

## 🧹 Очистка кеша (если возникли проблемы):

```bash
# Удалить node_modules и переустановить
rm -rf node_modules package-lock.json
npm install

# Или (Windows PowerShell):
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install
```

---

## 🌐 Узнать свой IP для локальной сети:

### Windows:
```powershell
ipconfig | Select-String "IPv4"
```

### macOS:
```bash
ifconfig | grep "inet "
```

### Linux:
```bash
ip addr show | grep "inet "
```

Затем друзья могут зайти по адресу: `http://ваш-ip:3000`

---

## 🚀 Деплой на Vercel (один клик):

```bash
# Установить Vercel CLI
npm install -g vercel

# Деплой
vercel

# Следуйте инструкциям - просто нажимайте Enter
```

Готово! Получите публичную ссылку типа `https://codenames-xyz.vercel.app`

---

## 📝 Все документы по порядку:

1. **START_HERE.md** - начните отсюда
2. **MIGRATION.md** - подробная миграция
3. **COMMANDS.md** - этот файл (быстрые команды)
4. **FIREBASE_SETUP.md** - настройка Firebase
5. **QUICKSTART.md** - быстрый старт Firebase
6. **README.md** - общая документация

---

Скопируйте нужный блок команд и вставьте в терминал! 🎉

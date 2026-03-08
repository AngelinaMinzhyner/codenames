// Слова для игры (можно расширить список)
const WORDS = [
    'СОБАКА', 'КОШКА', 'ДЕРЕВО', 'МОСТ', 'РЕКА', 'ГОРА', 'КНИГА', 'СТОЛ',
    'НЕБО', 'ЗВЕЗДА', 'ОКЕАН', 'ГОРОД', 'МУЗЫКА', 'ТАНЕЦ', 'СВЕТ', 'ТЕНЬ',
    'ДОЖДЬ', 'СНЕГ', 'ВЕТЕР', 'ОГОНЬ', 'ВОДА', 'ЗЕМЛЯ', 'КАМЕНЬ', 'ЦВЕТОК',
    'ПТИЦА', 'РЫБА', 'ЛЕС', 'ПОЛЕ', 'ДОМ', 'ОКНО', 'ДВЕРЬ', 'СТЕНА',
    'ВРЕМЯ', 'ДЕНЬ', 'НОЧЬ', 'УТРО', 'ВЕЧЕР', 'ЧАС', 'МИНУТА', 'СЕКУНДА',
    'СОЛНЦЕ', 'ЛУНА', 'ПЛАНЕТА', 'КОСМОС', 'РАКЕТА', 'САМОЛЕТ', 'КОРАБЛЬ', 'МАШИНА',
    'ДОРОГА', 'УЛИЦА', 'ПЛОЩАДЬ', 'ПАРК', 'САД', 'ПЛЯЖ', 'МОРЕ', 'ВОЛНА',
    'ПЕСОК', 'ОСТРОВ', 'КОНТИНЕНТ', 'СТРАНА', 'СТОЛИЦА', 'ГОРОД', 'СЕЛО', 'ДЕРЕВНЯ',
    'ЛЕД', 'ПАР', 'ОБЛАКО', 'ТУМАН', 'РАДУГА', 'МОЛНИЯ', 'ГРОМ', 'ТУЧА',
    'ЗИМА', 'ВЕСНА', 'ЛЕТО', 'ОСЕНЬ', 'МЕСЯЦ', 'ГОД', 'ВЕК', 'ЭРА',
    'ИСТОРИЯ', 'БУДУЩЕЕ', 'ПРОШЛОЕ', 'НАСТОЯЩЕЕ', 'ПАМЯТЬ', 'МЕЧТА', 'СОН', 'ЯВЬ',
    'ПРАВДА', 'ЛОЖЬ', 'ДОБРО', 'ЗЛО', 'МИР', 'ВОЙНА', 'ПОБЕДА', 'ПОРАЖЕНИЕ',
    'ИГРА', 'СПОРТ', 'ФУТБОЛ', 'ХОККЕЙ', 'ТЕННИС', 'ШАХМАТЫ', 'КАРТЫ', 'КОСТИ'
];

// Состояние игры
let gameState = {
    cards: [],
    currentTeam: 'red', // 'red' или 'blue'
    isCaptainMode: false,
    redScore: 9,
    blueScore: 9,
    gameOver: false,
    hintGiven: false,
    canGuess: false
};

// Инициализация игры
function initGame() {
    // Выбираем 28 случайных слов
    const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
    const selectedWords = shuffled.slice(0, 28);
    
    // Создаем массив типов карт: 9 красных, 9 синих, 1 бомба, 9 нейтральных
    const cardTypes = [
        ...Array(9).fill('red'),
        ...Array(9).fill('blue'),
        'bomb',
        ...Array(9).fill('neutral')
    ];
    
    // Перемешиваем типы
    const shuffledTypes = cardTypes.sort(() => Math.random() - 0.5);
    
    // Создаем карты
    gameState.cards = selectedWords.map((word, index) => ({
        word: word,
        type: shuffledTypes[index],
        revealed: false
    }));
    
    gameState.currentTeam = 'red';
    gameState.redScore = 9;
    gameState.blueScore = 9;
    gameState.gameOver = false;
    gameState.hintGiven = false;
    gameState.canGuess = false;
    
    renderBoard();
    updateUI();
}

// Отрисовка игрового поля
function renderBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    
    gameState.cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.textContent = card.word;
        cardElement.dataset.index = index;
        
        // Показываем цвет карты капитанам
        if (gameState.isCaptainMode && !card.revealed) {
            cardElement.classList.add(`captain-view-${card.type}`);
        }
        
        // Показываем открытые карты
        if (card.revealed) {
            cardElement.classList.add('revealed', `revealed-${card.type}`);
        }
        
        cardElement.addEventListener('click', () => handleCardClick(index));
        board.appendChild(cardElement);
    });
}

// Обработка клика по карте
function handleCardClick(index) {
    const card = gameState.cards[index];
    
    // Нельзя кликать если игра окончена или карта уже открыта
    if (gameState.gameOver || card.revealed) return;
    
    // Капитан не может открывать карты
    if (gameState.isCaptainMode) {
        alert('Капитан не может открывать карты! Переключитесь в режим игрока.');
        return;
    }
    
    // Игроки могут открывать только после подсказки капитана
    if (!gameState.canGuess) {
        alert('Ожидается подсказка от капитана!');
        return;
    }
    
    // Открываем карту
    card.revealed = true;
    
    // Проверяем результат
    if (card.type === 'bomb') {
        // Попали на бомбу - противоположная команда выигрывает
        gameState.gameOver = true;
        const winner = gameState.currentTeam === 'red' ? 'Синяя' : 'Красная';
        showWinner(`${winner} команда победила! ${gameState.currentTeam === 'red' ? 'Красная' : 'Синяя'} команда попала на мину! 💣`);
    } else if (card.type === gameState.currentTeam) {
        // Угадали свою карту
        if (gameState.currentTeam === 'red') {
            gameState.redScore--;
        } else {
            gameState.blueScore--;
        }
        
        // Проверяем победу
        if (gameState.redScore === 0) {
            gameState.gameOver = true;
            showWinner('Красная команда победила! 🎉');
        } else if (gameState.blueScore === 0) {
            gameState.gameOver = true;
            showWinner('Синяя команда победила! 🎉');
        }
    } else {
        // Угадали чужую или нейтральную карту - ход переходит
        if (card.type === 'red') {
            gameState.redScore--;
        } else if (card.type === 'blue') {
            gameState.blueScore--;
        }
        switchTurn();
    }
    
    renderBoard();
    updateUI();
}

// Переключение хода
function switchTurn() {
    gameState.currentTeam = gameState.currentTeam === 'red' ? 'blue' : 'red';
    gameState.hintGiven = false;
    gameState.canGuess = false;
    updateUI();
}

// Обновление UI
function updateUI() {
    document.getElementById('redScore').textContent = gameState.redScore;
    document.getElementById('blueScore').textContent = gameState.blueScore;
    
    const teamName = gameState.currentTeam === 'red' ? 'Красная' : 'Синяя';
    document.getElementById('currentTurn').textContent = `Ход: ${teamName} команда`;
    
    // Обновляем кнопку режима капитана
    const captainBtn = document.getElementById('toggleCaptain');
    captainBtn.textContent = gameState.isCaptainMode ? 'Режим: Капитан' : 'Режим: Игрок';
    
    // Обновляем поля подсказки
    const hintWord = document.getElementById('hintWord');
    const hintCount = document.getElementById('hintCount');
    const giveHintBtn = document.getElementById('giveHint');
    
    if (gameState.isCaptainMode && !gameState.hintGiven && !gameState.gameOver) {
        hintWord.disabled = false;
        hintCount.disabled = false;
        giveHintBtn.disabled = false;
    } else {
        hintWord.disabled = true;
        hintCount.disabled = true;
        giveHintBtn.disabled = true;
    }
    
    // Обновляем кнопку окончания хода
    document.getElementById('endTurn').disabled = gameState.gameOver || !gameState.canGuess;
}

// Показать победителя
function showWinner(message) {
    document.getElementById('winnerText').textContent = message;
    document.getElementById('gameOverModal').classList.add('show');
}

// Дать подсказку
function giveHint() {
    const hintWord = document.getElementById('hintWord').value.trim();
    const hintCount = document.getElementById('hintCount').value;
    
    if (!hintWord) {
        alert('Введите слово-подсказку!');
        return;
    }
    
    if (!hintCount || hintCount < 1) {
        alert('Укажите количество слов!');
        return;
    }
    
    alert(`Подсказка: "${hintWord}" - ${hintCount} слов(а). Теперь команда может угадывать!`);
    
    gameState.hintGiven = true;
    gameState.canGuess = true;
    
    document.getElementById('hintWord').value = '';
    document.getElementById('hintCount').value = '';
    
    updateUI();
}

// Обработчики событий
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    
    // Новая игра
    document.getElementById('newGame').addEventListener('click', () => {
        document.getElementById('gameOverModal').classList.remove('show');
        initGame();
    });
    
    // Играть снова
    document.getElementById('playAgain').addEventListener('click', () => {
        document.getElementById('gameOverModal').classList.remove('show');
        initGame();
    });
    
    // Переключение режима капитана
    document.getElementById('toggleCaptain').addEventListener('click', () => {
        gameState.isCaptainMode = !gameState.isCaptainMode;
        renderBoard();
        updateUI();
    });
    
    // Закончить ход
    document.getElementById('endTurn').addEventListener('click', () => {
        switchTurn();
        renderBoard();
    });
    
    // Дать подсказку
    document.getElementById('giveHint').addEventListener('click', giveHint);
    
    // Enter для подсказки
    document.getElementById('hintWord').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !document.getElementById('giveHint').disabled) {
            giveHint();
        }
    });
});

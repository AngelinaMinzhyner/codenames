import { getThemeWords } from './themes';

// Генерация игрового поля
export function generateCards(words) {
  // Если words не предоставлены, используем стандартные слова
  const availableWords = words || getThemeWords('classic');
  
  // Выбираем 28 случайных слов
  const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
  const selectedWords = shuffled.slice(0, 28);
  
  // Создаем массив типов карт
  const cardTypes = [
    ...Array(9).fill('red'),
    ...Array(9).fill('blue'),
    'bomb',
    ...Array(9).fill('neutral')
  ];
  
  // Перемешиваем типы
  const shuffledTypes = cardTypes.sort(() => Math.random() - 0.5);
  
  // Создаем карты
  return selectedWords.map((word, index) => ({
    id: index,
    word: word,
    type: shuffledTypes[index],
    revealed: false
  }));
}

// Проверка победы
export function checkWinner(cards) {
  const redRevealed = cards.filter(c => c.type === 'red' && c.revealed).length;
  const blueRevealed = cards.filter(c => c.type === 'blue' && c.revealed).length;
  const bombRevealed = cards.find(c => c.type === 'bomb' && c.revealed);
  
  if (bombRevealed) {
    // Команда попала на бомбу - победа противника
    return bombRevealed;
  }
  
  if (redRevealed === 9) return 'red';
  if (blueRevealed === 9) return 'blue';
  
  return null;
}

// Подсчет оставшихся слов
export function countRemaining(cards) {
  const redRemaining = cards.filter(c => c.type === 'red' && !c.revealed).length;
  const blueRemaining = cards.filter(c => c.type === 'blue' && !c.revealed).length;
  
  return { red: redRemaining, blue: blueRemaining };
}

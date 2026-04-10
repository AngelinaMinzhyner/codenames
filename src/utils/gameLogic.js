import { getThemeWords } from './themes';

// Генерация игрового поля
export function generateCards(words) {
  let availableWords = words && words.length ? words : getThemeWords('classic');
  if (availableWords.length < 28) {
    availableWords = getThemeWords('classic');
  }
  
  // Выбираем 28 случайных слов
  const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
  const selectedWords = shuffled.slice(0, 28);
  
  // Создаем массив типов карт (черная / белая команда)
  const cardTypes = [
    ...Array(9).fill('black'),
    ...Array(9).fill('white'),
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
  const blackRevealed = cards.filter(c => c.type === 'black' && c.revealed).length;
  const whiteRevealed = cards.filter(c => c.type === 'white' && c.revealed).length;
  const bombRevealed = cards.find(c => c.type === 'bomb' && c.revealed);
  
  if (bombRevealed) {
    return bombRevealed;
  }
  
  if (blackRevealed === 9) return 'black';
  if (whiteRevealed === 9) return 'white';
  
  return null;
}

// Подсчет оставшихся слов
export function countRemaining(cards) {
  const blackRemaining = cards.filter(c => c.type === 'black' && !c.revealed).length;
  const whiteRemaining = cards.filter(c => c.type === 'white' && !c.revealed).length;
  
  return { black: blackRemaining, white: whiteRemaining };
}

export const GAME_OPTIONS = [
  {
    id: 'codenames',
    name: 'CodeNames',
    shortName: 'CodeNames',
    description: 'Командная игра с капитанами, подсказками и полем слов.',
    accent: 'game-codenames'
  },
  {
    id: 'whoami',
    name: 'Кто я',
    shortName: 'Кто я',
    description: 'Игроки получают слова от остальных и ведут свои личные заметки.',
    accent: 'game-whoami'
  },
  {
    id: 'spy',
    name: 'Шпион',
    shortName: 'Шпион',
    description: 'Один не знает общего персонажа по теме — остальные в курсе. Играйте устно без лишних действий в приложении.',
    accent: 'game-spy'
  }
];

export const getGameById = (gameId) => GAME_OPTIONS.find((game) => game.id === gameId) || null;
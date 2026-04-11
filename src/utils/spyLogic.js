/**
 * Распределение ролей: один случайный шпион; всем остальным — один и тот же персонаж из темы.
 * Порядок ходов — случайная перестановка всех игроков (новая при каждом старте).
 * @param {Array<{ id: string }>} players
 * @param {string[]} words — хотя бы одно имя в теме
 * @returns {{ spyPlayerId: string, characterByPlayer: Record<string, string>, turnOrder: string[], currentTurnIndex: number }}
 */
export function distributeSpyRoles(players, words) {
  if (!players?.length || players.length < 2) {
    throw new Error('Нужно минимум 2 игрока');
  }
  const unique = [...new Set(words.map((w) => String(w).trim()).filter(Boolean))];
  if (unique.length < 1) {
    throw new Error('В теме нет персонажей');
  }

  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
  const spyPlayerId = shuffledPlayers[0].id;
  const nonSpy = shuffledPlayers.slice(1);

  const pool = [...unique].sort(() => Math.random() - 0.5);
  const sharedCharacter = pool[0];

  const characterByPlayer = {};
  nonSpy.forEach((p) => {
    characterByPlayer[p.id] = sharedCharacter;
  });

  const turnOrder = [...players].map((p) => p.id).sort(() => Math.random() - 0.5);

  return { spyPlayerId, characterByPlayer, turnOrder, currentTurnIndex: 0 };
}

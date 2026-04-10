/**
 * Распределение ролей: один случайный шпион, остальным — уникальные персонажи из темы.
 * @param {Array<{ id: string }>} players
 * @param {string[]} words — достаточно минимум players.length - 1 уникальных имён
 * @returns {{ spyPlayerId: string, characterByPlayer: Record<string, string> }}
 */
export function distributeSpyRoles(players, words) {
  if (!players?.length || players.length < 2) {
    throw new Error('Нужно минимум 2 игрока');
  }
  const need = players.length - 1;
  const unique = [...new Set(words.map((w) => String(w).trim()).filter(Boolean))];
  if (unique.length < need) {
    throw new Error(
      `В теме не хватает персонажей: нужно ${need}, доступно ${unique.length}`
    );
  }

  const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
  const spyPlayerId = shuffledPlayers[0].id;
  const nonSpy = shuffledPlayers.slice(1);

  const pool = [...unique].sort(() => Math.random() - 0.5);
  const characterByPlayer = {};
  nonSpy.forEach((p, i) => {
    characterByPlayer[p.id] = pool[i];
  });

  return { spyPlayerId, characterByPlayer };
}

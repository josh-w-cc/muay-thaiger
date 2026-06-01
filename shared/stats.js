export const FIGHTER_STAT_KEYS = ['anima', 'agility', 'constitution', 'durability', 'reach', 'skill', 'speed', 'stamina', 'strength', 'vigor', 'vitality'];

export function parseBigIntStats(stats) {
  return Object.fromEntries(
    Object.entries(stats).map(([key, value]) => [key, BigInt(value ?? 0)]),
  );
}

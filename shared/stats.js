export const FIGHTER_STAT_KEYS = ['anima', 'constitution', 'durability', 'reach', 'skill', 'speed', 'stamina', 'vigor', 'vitality'];

export function parseBigIntStats(stats) {
  return Object.fromEntries(
    Object.entries(stats).map(([key, value]) => [key, BigInt(value ?? 0)]),
  );
}

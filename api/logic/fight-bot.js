export function generateGoldBotStats(fighterStats = {}) {
  const apm = getPositiveNumber(fighterStats.apm, 10);
  const attack = getPositiveNumber(fighterStats.attack, 10);
  const defense = getPositiveNumber(fighterStats.defense, 10);
  const health = getPositiveNumber(fighterStats.health, 100);
  const power = getPositiveNumber(fighterStats.power, 10);
  const stamina = getPositiveNumber(fighterStats.stamina, 20);
  return {
    apm: Math.max(4, apm) * (Math.random() + 0.5),
    attack: Math.sqrt(attack) * (Math.random() + 0.5),
    defense: Math.sqrt(defense) * (Math.random() + 0.5),
    health: health * 10 * (Math.random() + 0.5),
    power: power * (Math.random() + 0.5),
    stamina: stamina * Math.sqrt(stamina) * (Math.random() + 0.5),
  };
}

function getPositiveNumber(value, fallback) {
  const nextValue = Number(value);
  if(Number.isFinite(nextValue) && nextValue > 0) {
    return nextValue;
  }
  return fallback;
}

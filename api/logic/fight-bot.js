import '../../shared/bigInt.js';

export function generateGoldBotStats(fighterBaseStats = {}) {
  const {agility, constitution, durability, reach, skill, stamina, strength} = getBaseStats(fighterBaseStats);
  const apm = maxBigInt(4n, agility.logApprox() + skill.logApprox());
  const attack = stamina.logApprox() + agility.logApprox() + skill + reach;
  const defense = agility.logApprox() + stamina.logApprox() + skill;
  const health = stamina + constitution * constitution + durability * durability;
  const power = (strength + agility) * stamina.logApprox() + skill;

  return {
    apm: applyRandomVariance(apm),
    attack: applyRandomVariance(attack),
    defense: applyRandomVariance(defense),
    health: applyRandomVariance(health),
    power: applyRandomVariance(power),
    stamina: applyRandomVariance(stamina),
  };
}

function getBaseStats(fighterBaseStats) {
  return {
    agility: getPositiveBigInt(fighterBaseStats.speed, 1n),
    constitution: getPositiveBigInt(fighterBaseStats.constitution, 1n),
    durability: getPositiveBigInt(fighterBaseStats.durability, 1n),
    reach: getPositiveBigInt(fighterBaseStats.reach, 1n),
    skill: getPositiveBigInt(fighterBaseStats.skill, 1n),
    stamina: getPositiveBigInt(fighterBaseStats.stamina, 1n),
    strength: getPositiveBigInt(fighterBaseStats.strength ?? fighterBaseStats.vigor, 1n),
  };
}

function applyRandomVariance(value) {
  const randomFactor = BigInt(Math.floor((Math.random() + 0.5) * 100));
  return value * randomFactor / 100n;
}

function getPositiveBigInt(value, fallback) {
  try {
    const nextValue = BigInt(value);
    if(nextValue > 0n) {
      return nextValue;
    }
  }
  catch {
    // ignored
  }
  return fallback;
}

function maxBigInt(left, right) {
  if(left > right) {
    return left;
  }
  return right;
}

import {parseWholeBigInt, toSafeNumber} from 'shared/fighter-stats.js';


export function createEnemy(bet) {
  return {
    apm: Math.max(4, Math.log(bet)) * (Math.random() + 0.5),
    attack: Math.sqrt(bet) * (Math.random() + 0.5),
    defense: Math.sqrt(bet) * (Math.random() + 0.5),
    health: bet * 10 * (Math.random() + 0.5),
    power: bet * (Math.random() + 0.5),
    stamina: bet * Math.sqrt(bet) * (Math.random() + 0.5),
  };
}

export function createEnemyFromBet(bet) {
  return createEnemy(toSafeNumber(bet));
}

export function createFightFighter(fighter) {
  return {
    ...fighter,
    apm: toSafeNumber(fighter.apm),
    attack: toSafeNumber(fighter.attack),
    defense: toSafeNumber(fighter.defense),
    health: toSafeNumber(fighter.health),
    power: toSafeNumber(fighter.power),
    stamina: toSafeNumber(fighter.stamina),
  };
}

export function getFightBet(gold, numerator, denominator) {
  const goldValue = parseWholeBigInt(gold) ?? 0n;
  const scaledGold = goldValue * numerator / denominator;
  return scaledGold > 100n ? scaledGold : 100n;
}

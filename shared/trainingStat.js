const TRAINING_MULTIPLIER_BY_STAT = Object.freeze({
  agility: 'speed',
  constitution: 'vitality',
  skill: 'anima',
  stamina: 'vitality',
  strength: 'vigor',
});

export function getTrainingEffect({anima = 0n, speed = 0n, vigor = 0n, vitality = 0n}) {
  return {
    agility: speed,
    constitution: vitality,
    skill: anima,
    stamina: vitality,
    strength: vigor,
  };
}

export default function trainStat(stats, stat, amount = 1n) {
  const trainingMultiplier = getTrainingMultiplier(stats, stat);
  stats[stat] = stats[stat] + trainingMultiplier * BigInt(amount);
  return stats[stat];
}

function getTrainingMultiplier(stats, stat) {
  const multiplierStat = TRAINING_MULTIPLIER_BY_STAT[stat];
  if(!multiplierStat) {
    return 1n;
  }
  return stats[multiplierStat];
}

const TRAINING_MULTIPLIER_BY_STAT = Object.freeze({
  agility: 'speed',
  constitution: 'vitality',
  skill: 'anima',
  stamina: 'vitality',
  strength: 'vigor',
});

export function getTrainingEffect({anima = 0, speed = 0, vigor = 0, vitality = 0}) {
  return {
    agility: speed,
    constitution: vitality,
    skill: anima,
    stamina: vitality,
    strength: vigor,
  };
}

export function getTrainedStatValue(stats, stat, amount = 1) {
  const multiplierStat = TRAINING_MULTIPLIER_BY_STAT[stat];
  if(multiplierStat === undefined) {
    return null;
  }
  return BigInt(stats[stat] ?? 0) + BigInt(stats[multiplierStat] ?? 0) * BigInt(amount);
}

export default function trainStat(stats, stat, amount = 1) {
  const trainedStatValue = getTrainedStatValue(stats, stat, amount);
  if(trainedStatValue === null) {
    return null;
  }
  stats[stat] = trainedStatValue;
  return stats[stat];
}

export function getTrainingEffect({anima, speed, vigor, vitality}) {
  return {
    agility: speed,
    constitution: vitality,
    skill: anima,
    stamina: vitality,
    strength: vigor,
  };
}

export function getTrainedStatValue(stats, stat, multiplier = 1) {
  const trainingEffect = getTrainingEffect(stats);
  if(!Object.hasOwn(trainingEffect, stat)) {
    return null;
  }

  return (stats[stat] || 0) + trainingEffect[stat] * multiplier;
}

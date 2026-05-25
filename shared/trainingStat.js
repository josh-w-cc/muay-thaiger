import {getTrainedStatValue} from './training.js';

export default function trainStat(stats, stat, amount = 1) {
  const trainedStatValue = getTrainedStatValue(stats, stat, amount);
  if(trainedStatValue === null) {
    return null;
  }

  stats[stat] = trainedStatValue;
  return trainedStatValue;
}

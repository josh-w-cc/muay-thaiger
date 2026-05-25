import {applyTrainingActions, getTrainedStatValue} from 'shared/training.js';
import {createTrainingTimeline} from './training-timeline.js';

export async function applyTraining({fighterActions, fighters}, fighter) {
  const actions = await fighterActions.listByFighterID(fighter.id);
  if(!actions.length) {
    return {actions, fighter};
  }
  const now = new Date();
  const trainingTimeline = createTrainingTimeline(actions, now);
  const {gold, stats} = trainStats(trainingTimeline.appliedActions, fighter);
  const updatedFighter = await fighters.update(fighter.id, {gold, stats});
  await touchAppliedActions(fighterActions, actions, trainingTimeline.touchedAtByActionID);
  return {actions, fighter: updatedFighter};
}

async function touchAppliedActions(fighterActions, actions, touchedAtByActionID) {
  for(const action of actions) {
    if(!touchedAtByActionID.has(action.id)) {
      continue;
    }
    await fighterActions.touch(action.id, touchedAtByActionID.get(action.id));
  }
}

function trainStats(actions, fighter) {
  const stats = {...fighter.stats};
  let gold = BigInt(fighter.gold ?? 0);
  const proxy = createFighterProxy(stats, (amount) => {
    gold += BigInt(amount);
  });
  applyTrainingActions(actions, proxy);
  return {gold, stats};
}

function createFighterProxy(stats, onWin) {
  return {
    train: (stat, multiplier = 1n) => {
      const trainedStatValue = getTrainedStatValue(stats, stat, multiplier);
      if(trainedStatValue === null) {
        return;
      }

      stats[stat] = trainedStatValue;
    },
    win: onWin,
  };
}

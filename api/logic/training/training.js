import {
  applyTrainingActions,
  createTrainingTimeline,
} from 'shared/training.js';
import trainStat from 'shared/trainingStat.js';

export async function applyTraining({fighterActions, fighters}, fighter) {
  const actions = await fighterActions.listByFighterID(fighter.id);
  if(!actions.length) {
    return {actions, fighter};
  }
  const now = new Date();
  const {appliedActions, touchedAtByActionKey} = createTrainingTimeline(actions, {
    getTouchedAtKey: (action) => action.id,
    now,
  });
  const {gold, stats} = trainStats(appliedActions, fighter);
  const updatedFighter = await fighters.update(fighter.id, {gold, stats});
  const updatedActions = await touchAppliedActions(fighterActions, actions, touchedAtByActionKey);
  return {actions: updatedActions, fighter: updatedFighter};
}

async function touchAppliedActions(fighterActions, actions, touchedAtByActionID) {
  const updatedActions = [];
  for(const action of actions) {
    const touchedAt = touchedAtByActionID.get(action.id);
    if(touchedAt === undefined) {
      updatedActions.push(action);
      continue;
    }
    await fighterActions.touch(action.id, touchedAt);
    updatedActions.push({...action, touched_at: touchedAt.toISOString()});
  }
  return updatedActions;
}

function trainStats(actions, fighter) {
  const stats = {...fighter.stats};
  let gold = fighter.gold;
  const proxy = createFighterProxy(stats, (amount) => {
    gold += amount;
  });
  applyTrainingActions(actions, proxy);
  return {gold, stats};
}

export function createFighterProxy(stats, onWin) {
  return {
    train: (stat, amount = 1n) => trainStat(stats, stat, amount),
    win: onWin,
  };
}

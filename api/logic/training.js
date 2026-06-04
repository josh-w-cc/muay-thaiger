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
  await touchAppliedActions(fighterActions, actions, touchedAtByActionKey);
  const updatedActions = actions.map((action) => {
    const touchedAt = touchedAtByActionKey.get(action.id);
    if(touchedAt === undefined) {
      return action;
    }
    return {...action, touched_at: touchedAt.toISOString()};
  });
  return {actions: updatedActions, fighter: updatedFighter};
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
  let gold = fighter.gold;
  const proxy = createFighterProxy(stats, (amount) => {
    gold += amount;
  });
  applyTrainingActions(actions, proxy);
  return {gold, stats};
}

function createFighterProxy(stats, onWin) {
  return {
    train: (stat, amount = 1n) => trainStat(stats, stat, amount),
    win: onWin,
  };
}

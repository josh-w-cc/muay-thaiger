import addHugeNumber from 'shared/addHugeNumber.js';
import {SKILL_DEFINITIONS, SKILL_IDS} from 'shared/skills.js';

const SKILLS_BY_ACTION_ID = Object.freeze(
  Object.fromEntries(
    Object.entries(SKILL_IDS).map(([key, id]) => [id, SKILL_DEFINITIONS[key]]),
  ),
);

export async function applyTraining({fighterActions, fighters}, fighter) {
  const actions = await fighterActions.listByFighterID(fighter.id);
  if(!actions.length) {
    return {actions, fighter};
  }
  const {gold, stats} = trainStats(actions, fighter);
  const updatedFighter = await fighters.update(fighter.id, {gold, stats});
  await Promise.all(actions.map((action) => fighterActions.touch(action.id)));
  return {actions, fighter: updatedFighter};
}

function createFighterProxy(stats, onWin) {
  const trainingEffect = getTrainingEffect(stats);
  return {
    train: (stat, amount = 1) => {
      if(!Object.hasOwn(trainingEffect, stat)) {
        return;
      }
      stats[stat] = (stats[stat] || 0) + trainingEffect[stat] * amount;
    },
    win: onWin,
  };
}

function getTrainingEffect(stats) {
  return {
    agility: stats.speed,
    constitution: stats.vitality,
    skill: stats.anima,
    stamina: stats.vitality,
    strength: stats.strength,
  };
}

function trainStats(actions, fighter) {
  const stats = {...fighter.stats};
  let gold = fighter.gold;
  const proxy = createFighterProxy(stats, (amount) => {
    gold = addHugeNumber(gold, amount);
  });
  for(const action of actions) {
    SKILLS_BY_ACTION_ID[action.action_id]?.action(proxy);
  }
  return {gold, stats};
}

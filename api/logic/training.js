import addHugeNumber from 'shared/addHugeNumber.js';
import {SKILL_DEFINITIONS, SKILL_IDS} from 'shared/skills.js';
import {createTrainingTimeline} from './training-timeline.js';

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
  const now = new Date();
  const trainingTimeline = createTrainingTimeline(actions, SKILLS_BY_ACTION_ID, now);
  const {gold, stats} = trainStats(trainingTimeline.appliedActions, fighter);
  const updatedFighter = await fighters.update(fighter.id, {gold, stats});
  await touchAppliedActions(fighterActions, actions, trainingTimeline.touchedAtByActionID);
  return {actions, fighter: updatedFighter};
}

function createFighterProxy(stats, onWin) {
  const trainingEffect = {
    agility: stats.speed,
    constitution: stats.vitality,
    skill: stats.anima,
    stamina: stats.vitality,
    strength: stats.strength,
  };
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

function trainStats(actions, fighter) {
  const stats = {...fighter.stats};
  let gold = fighter.gold;
  const proxy = createFighterProxy(stats, (amount) => {
    gold = addHugeNumber(gold, amount);
  });
  for(const action of actions) {
    action.skill.action(proxy);
  }
  return {gold, stats};
}

async function touchAppliedActions(fighterActions, actions, touchedAtByActionID) {
  for(const action of actions) {
    if(!touchedAtByActionID.has(action.id)) {
      continue;
    }
    await fighterActions.touch(action.id, touchedAtByActionID.get(action.id));
  }
}

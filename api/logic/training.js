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
  const now = new Date();
  const trainingTimeline = createTrainingTimeline(actions, now);
  const {gold, stats} = trainStats(trainingTimeline.appliedActions, fighter);
  const updatedFighter = await fighters.update(fighter.id, {gold, stats});
  await touchAppliedActions(fighterActions, actions, trainingTimeline.touchedAtByActionID);
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
    action.skill.action(proxy);
  }
  return {gold, stats};
}

function createTrainingTimeline(actions, now) {
  const nowMs = now.getTime();
  const scheduledActions = actions
    .map((action) => ({...action, skill: SKILLS_BY_ACTION_ID[action.action_id]}))
    .filter((action) => action.skill?.duration > 0);
  if(!scheduledActions.length) {
    return {appliedActions: [], touchedAtByActionID: new Map()};
  }
  const latestActionIndex = findLatestActionIndex(scheduledActions, nowMs);
  let remainingMs = nowMs - getActionTime(scheduledActions[latestActionIndex], nowMs);
  if(remainingMs <= 0) {
    return {appliedActions: [], touchedAtByActionID: new Map()};
  }
  const appliedActions = [];
  const touchedAtByActionID = new Map();
  let actionIndex = (latestActionIndex + 1) % scheduledActions.length;
  while(remainingMs >= getDurationMs(scheduledActions[actionIndex])) {
    const action = scheduledActions[actionIndex];
    remainingMs -= getDurationMs(action);
    appliedActions.push(action);
    touchedAtByActionID.set(action.id, new Date(nowMs - remainingMs));
    actionIndex = (actionIndex + 1) % scheduledActions.length;
  }
  return {appliedActions, touchedAtByActionID};
}

function findLatestActionIndex(actions, nowMs) {
  let latestActionIndex = 0;
  let latestActionTime = getActionTime(actions[latestActionIndex], nowMs);
  for(let index = 1; index < actions.length; index += 1) {
    const actionTime = getActionTime(actions[index], nowMs);
    if(actionTime >= latestActionTime) {
      latestActionIndex = index;
      latestActionTime = actionTime;
    }
  }
  return latestActionIndex;
}

function getActionTime(action, nowMs) {
  const actionTime = Date.parse(action.touched_at || action.created_at || '');
  if(Number.isNaN(actionTime)) {
    return nowMs;
  }
  return actionTime;
}

function getDurationMs(action) {
  return action.skill.duration * 1000;
}

async function touchAppliedActions(fighterActions, actions, touchedAtByActionID) {
  for(const action of actions) {
    if(!touchedAtByActionID.has(action.id)) {
      continue;
    }
    await fighterActions.touch(action.id, touchedAtByActionID.get(action.id));
  }
}

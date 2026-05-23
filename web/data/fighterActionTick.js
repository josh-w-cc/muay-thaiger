import {SKILL_DEFINITIONS, SKILL_IDS} from 'shared/skills.js';

import useFighterStore from '@/data/fighter.js';


const SKILLS_BY_ACTION_ID = Object.freeze(
  Object.fromEntries(
    Object.entries(SKILL_IDS).map(([key, id]) => [id, SKILL_DEFINITIONS[key]]),
  ),
);

export function runFighterActionTick(actions) {
  const nowMs = Date.now();
  const scheduledActions = getScheduledActions(actions);
  const {appliedActions, touchedAtByActionIndex} = runTrainingCycle(scheduledActions, nowMs);
  trainFighter(appliedActions);
  return actions.map((action, index) => (
    touchedAtByActionIndex.has(index)
      ? {...action, touched_at: touchedAtByActionIndex.get(index)}
      : action
  ));
}

function getScheduledActions(actions) {
  return actions
    .map((action, index) => ({action, durationMs: (SKILLS_BY_ACTION_ID[action.action_id]?.duration || 0) * 1000, index}))
    .filter((action) => action.durationMs > 0);
}

function runTrainingCycle(scheduledActions, nowMs) {
  if(!scheduledActions.length) {
    return {appliedActions: [], touchedAtByActionIndex: new Map()};
  }
  const {latestActionIndex, latestActionTime} = findLatestAction(scheduledActions, nowMs);
  const remainingMs = nowMs - latestActionTime;
  if(remainingMs <= 0) {
    return {appliedActions: [], touchedAtByActionIndex: new Map()};
  }
  return collectCompletedActions(scheduledActions, nowMs, remainingMs, latestActionIndex);
}

function findLatestAction(actions, nowMs) {
  let latestActionIndex = 0;
  let latestActionTime = getActionTime(actions[latestActionIndex].action, nowMs);
  for(let index = 1; index < actions.length; index += 1) {
    const actionTime = getActionTime(actions[index].action, nowMs);
    if(actionTime >= latestActionTime) {
      latestActionIndex = index;
      latestActionTime = actionTime;
    }
  }
  return {latestActionIndex, latestActionTime};
}

function getActionTime(action, nowMs) {
  const actionTime = Date.parse(action.touched_at || action.created_at || '');
  if(Number.isNaN(actionTime)) {
    return nowMs;
  }
  return actionTime;
}

function collectCompletedActions(scheduledActions, nowMs, startingRemainingMs, latestActionIndex) {
  const appliedActions = [];
  const touchedAtByActionIndex = new Map();
  let remainingMs = startingRemainingMs;
  let actionIndex = (latestActionIndex + 1) % scheduledActions.length;
  while(remainingMs >= scheduledActions[actionIndex].durationMs) {
    remainingMs -= scheduledActions[actionIndex].durationMs;
    appliedActions.push(scheduledActions[actionIndex].action);
    touchedAtByActionIndex.set(scheduledActions[actionIndex].index, new Date(nowMs - remainingMs).toISOString());
    actionIndex = (actionIndex + 1) % scheduledActions.length;
  }
  return {appliedActions, touchedAtByActionIndex};
}

function trainFighter(actions) {
  if(!actions.length) {
    return;
  }
  const fighter = useFighterStore.getState();
  for(const action of actions) {
    applyAction(action, fighter);
  }
}

function applyAction(action, fighter) {
  const skill = getActionSkill(action);
  if(!skill?.action) {
    return;
  }
  skill.action(fighter);
}

function getActionSkill(action) {
  if(!action?.action_id) {
    return null;
  }
  return SKILLS_BY_ACTION_ID[action.action_id];
}

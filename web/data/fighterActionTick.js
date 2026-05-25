import {SKILLS_BY_ACTION_ID} from 'shared/skills.js';
import {createTrainingTimeline} from 'shared/trainingTimeline.js';

import useFighterStore from '@/data/fighter.js';


export function runFighterActionTick(actions) {
  const nowMs = Date.now();
  const {appliedActions, touchedAtByActionKey} = createTrainingTimeline(actions, {
    getDurationMs: (action) => (SKILLS_BY_ACTION_ID[action.action_id]?.duration || 0) * 1000,
    getTouchedAtValue: (touchedAt) => touchedAt.toISOString(),
    now: new Date(nowMs),
  });
  trainFighter(appliedActions);
  return actions.map((action, index) => (
    touchedAtByActionKey.has(index)
      ? {...action, touched_at: touchedAtByActionKey.get(index)}
      : action
  ));
}

export function findLatestAction(actions, nowMs) {
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

export function getActionTime(action, nowMs) {
  const actionTime = Date.parse(action.touched_at || action.created_at || '');
  if(Number.isNaN(actionTime)) {
    return nowMs;
  }
  return actionTime;
}

export function getScheduledActions(actions) {
  return actions
    .map((action, index) => ({action, durationMs: (SKILLS_BY_ACTION_ID[action.action_id]?.duration || 0) * 1000, index}))
    .filter((action) => action.durationMs > 0);
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
  skill.action(fighter);
}

function getActionSkill(action) {
  return SKILLS_BY_ACTION_ID[action.action_id];
}

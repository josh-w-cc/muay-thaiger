export function createTrainingTimeline(actions, skillsByActionID, now) {
  const nowMs = now.getTime();
  const scheduledActions = actions
    .map((action) => ({...action, skill: skillsByActionID[action.action_id]}))
    .filter((action) => action.skill?.duration > 0);
  if(!scheduledActions.length) {
    return {appliedActions: [], touchedAtByActionID: new Map()};
  }
  const {latestActionIndex, latestActionTime} = findLatestAction(scheduledActions, nowMs);
  const remainingMs = nowMs - latestActionTime;
  if(remainingMs <= 0) {
    return {appliedActions: [], touchedAtByActionID: new Map()};
  }
  return runTrainingCycle(scheduledActions, latestActionIndex, nowMs, remainingMs);
}

function findLatestAction(actions, nowMs) {
  let latestActionIndex = 0;
  let latestActionTime = getActionTime(actions[latestActionIndex], nowMs);
  for(let index = 1; index < actions.length; index += 1) {
    const actionTime = getActionTime(actions[index], nowMs);
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

function runTrainingCycle(actions, latestActionIndex, nowMs, startingRemainingMs) {
  const appliedActions = [];
  const touchedAtByActionID = new Map();
  let actionIndex = (latestActionIndex + 1) % actions.length;
  let remainingMs = startingRemainingMs;
  while(true) {
    const action = actions[actionIndex];
    const durationMs = action.skill.duration * 1000;
    if(remainingMs < durationMs) {
      break;
    }
    remainingMs -= durationMs;
    appliedActions.push(action);
    touchedAtByActionID.set(action.id, new Date(nowMs - remainingMs));
    actionIndex = (actionIndex + 1) % actions.length;
  }
  return {appliedActions, touchedAtByActionID};
}

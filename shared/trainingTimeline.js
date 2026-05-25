export function createTrainingTimeline(actions, {
  getDurationMs,
  getTouchedAtKey = (_, index) => index,
  getTouchedAtValue = (touchedAt) => touchedAt,
  now = new Date(),
}) {
  const nowMs = now.getTime();
  const scheduledActions = actions
    .map((action, index) => ({action, durationMs: getDurationMs(action), index}))
    .filter((action) => action.durationMs > 0);
  return createTimelineFromScheduledActions({
    getTouchedAtKey,
    getTouchedAtValue,
    nowMs,
    scheduledActions,
  });
}

function createTimelineFromScheduledActions({getTouchedAtKey, getTouchedAtValue, nowMs, scheduledActions}) {
  if(!scheduledActions.length) {
    return createEmptyTimeline();
  }
  const {latestActionIndex, latestActionTime} = findLatestAction(scheduledActions, nowMs);
  const remainingMs = nowMs - latestActionTime;
  if(remainingMs <= 0) {
    return createEmptyTimeline();
  }
  return runTrainingCycle(scheduledActions, latestActionIndex, nowMs, remainingMs, getTouchedAtKey, getTouchedAtValue);
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

function runTrainingCycle(actions, latestActionIndex, nowMs, startingRemainingMs, getTouchedAtKey, getTouchedAtValue) {
  const appliedActions = [];
  const touchedAtByActionKey = new Map();
  let actionIndex = (latestActionIndex + 1) % actions.length;
  let remainingMs = startingRemainingMs;
  while(true) {
    const action = actions[actionIndex];
    if(remainingMs < action.durationMs) {
      break;
    }
    remainingMs -= action.durationMs;
    appliedActions.push(action.action);
    const touchedAt = new Date(nowMs - remainingMs);
    touchedAtByActionKey.set(getTouchedAtKey(action.action, action.index), getTouchedAtValue(touchedAt));
    actionIndex = (actionIndex + 1) % actions.length;
  }
  return {appliedActions, touchedAtByActionKey};
}

function createEmptyTimeline() {
  return {appliedActions: [], touchedAtByActionKey: new Map()};
}

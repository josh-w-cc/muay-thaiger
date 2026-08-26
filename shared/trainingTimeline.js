export function createTrainingTimeline(actions, {
  getDurationMs,
  getTouchedAtKey = (_, index) => index,
  getTouchedAtValue = (touchedAt) => touchedAt,
  now = new Date(),
}) {
  const nowMs = now.getTime();
  const scheduledActions = getScheduledActions(actions, getDurationMs);
  return createTimelineFromScheduledActions({
    getTouchedAtKey,
    getTouchedAtValue,
    nowMs,
    scheduledActions,
  });
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

function getActionTime(action, nowMs) {
  const actionTime = Date.parse(action.touched_at || action.created_at || '');
  if(Number.isNaN(actionTime)) {
    return nowMs;
  }
  return actionTime;
}

export function getOrderedActions(actions, nowMs) {
  return [...actions].sort((leftAction, rightAction) => {
    const leftTime = getActionTime(leftAction.action, nowMs);
    const rightTime = getActionTime(rightAction.action, nowMs);
    if(leftTime === rightTime) {
      return leftAction.index - rightAction.index;
    }
    return leftTime - rightTime;
  });
}

export function getScheduledActions(actions, getDurationMs) {
  return actions
    .map((action, index) => ({action, durationMs: getDurationMs(action), index}))
    .filter((action) => action.durationMs > 0);
}

function createEmptyTimeline() {
  return {appliedActions: [], touchedAtByActionKey: new Map()};
}

function createTimelineFromScheduledActions({getTouchedAtKey, getTouchedAtValue, nowMs, scheduledActions}) {
  if(!scheduledActions.length) {
    return createEmptyTimeline();
  }
  const orderedActions = getOrderedActions(scheduledActions, nowMs);
  const {latestActionTime} = findLatestAction(orderedActions, nowMs);
  const remainingMs = nowMs - latestActionTime;
  if(remainingMs <= 0) {
    return createEmptyTimeline();
  }
  return runTrainingCycle(orderedActions, latestActionTime, remainingMs, getTouchedAtKey, getTouchedAtValue);
}

function runTrainingCycle(actions, latestActionTime, startingRemainingMs, getTouchedAtKey, getTouchedAtValue) {
  const appliedActions = [];
  const touchedAtByActionKey = new Map();
  let actionIndex = 0;
  let remainingMs = startingRemainingMs;
  let elapsedMs = 0;
  while(true) {
    const action = actions[actionIndex];
    if(remainingMs < action.durationMs) {
      break;
    }
    remainingMs -= action.durationMs;
    elapsedMs += action.durationMs;
    appliedActions.push(action.action);
    const touchedAt = new Date(latestActionTime + elapsedMs);
    touchedAtByActionKey.set(getTouchedAtKey(action.action, action.index), getTouchedAtValue(touchedAt));
    actionIndex = (actionIndex + 1) % actions.length;
  }
  return {appliedActions, touchedAtByActionKey};
}

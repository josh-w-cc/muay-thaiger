import {
  respondToAuth,
  routeToHubIfAuthorized,
} from '@/actions/websockets/auth.js';
import {connectSocketOnAppLoad, sendCommand} from '@/actions/websockets/index.js';
import useFightStore from '@/data/fight.js';
import {TickerState} from '@/pages/Game/Ticker.js';
import {isFightReason, normalizeFightReason} from 'shared/fights.js';
const MOVE_CLICK_BATCH_MILLISECONDS = 500;
const MOVE_LAST_USED_FUTURE_MILLISECONDS = 250;
let moveBatch = [];
let moveBatchDelta = 0;
let moveBatchStartedAt = null;
let moveCount = 0;

export function createFighterActionCmd(actionID) {
  sendCommand({action_id: actionID, cmd: 'idle'});
}

export function createFightCmd(reason, rank = '') {
  const normalizedReason = normalizeFightReason(reason);
  if(!isFightReason(normalizedReason)) {
    throw new Error('invalid-fight-reason');
  }
  sendCommand({cmd: 'fight', reason: normalizedReason, rank});
}

export function removeFighterActionCmd(actionID) {
  sendCommand({action_id: actionID, cmd: 'stop'});
}

export function moveCmd(moveID) {
  if(!Number.isInteger(moveID)) {
    console.error(`Invalid move:${moveID}`);
    return;
  }
  useFightStore.getState().markMoveUsed(moveID, getPredictedLastUsed());
  if(moveBatch.length === 0) {
    moveBatchStartedAt = Date.now();
  }
  moveBatch.push({move_id: moveID, move_num: moveCount});
  moveCount += 1;
}

export function selectFighterCmd() {
  respondToAuth(connectSocketOnAppLoad());
  routeToHubIfAuthorized();
}

function tickMoveBatch(delta) {
  if(moveBatch.length === 0) {
    moveBatchDelta = 0;
    moveBatchStartedAt = null;
    return;
  }
  moveBatchDelta += delta;
  if(moveBatchDelta < MOVE_CLICK_BATCH_MILLISECONDS) {
    return;
  }
  flushMoveBatch();
}

function flushMoveBatch() {
  moveBatchDelta = 0;
  moveBatchStartedAt = null;
  if(moveBatch.length === 0) {
    return;
  }
  const currentBatch = moveBatch;
  moveBatch = [];
  sendCommand({cmd: 'move', moves: currentBatch});
}

function getPredictedLastUsed() {
  const now = Date.now();
  if(!Number.isFinite(moveBatchStartedAt)) {
    return now + MOVE_LAST_USED_FUTURE_MILLISECONDS;
  }
  const millisecondsSinceMoveBatchStarted = Math.max(0, now - moveBatchStartedAt);
  const millisecondsUntilNextSync = Math.max(0, MOVE_CLICK_BATCH_MILLISECONDS - millisecondsSinceMoveBatchStarted);
  return now + millisecondsUntilNextSync;
}

TickerState.addListener(tickMoveBatch);

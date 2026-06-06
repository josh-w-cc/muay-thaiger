import {
  respondToAuth,
  routeToHubIfAuthorized,
} from '@/actions/websockets/auth.js';
import {connectSocketOnAppLoad, sendCommand} from '@/actions/websockets/index.js';
import {isFightReason, normalizeFightReason} from 'shared/fights.js';
const MOVE_CLICK_BATCH_MILLISECONDS = 500;
let moveBatchTimeoutID = null;
let moveClicksByID = new Map();

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
  moveClicksByID.set(moveID, (moveClicksByID.get(moveID) ?? 0) + 1);
  scheduleMoveBatch();
}

export function selectFighterCmd() {
  respondToAuth(connectSocketOnAppLoad());
  routeToHubIfAuthorized();
}

function scheduleMoveBatch() {
  if(moveBatchTimeoutID !== null) {
    return;
  }
  moveBatchTimeoutID = setTimeout(flushMoveBatch, MOVE_CLICK_BATCH_MILLISECONDS);
}

function flushMoveBatch() {
  moveBatchTimeoutID = null;
  if(moveClicksByID.size === 0) {
    return;
  }
  const currentBatch = moveClicksByID;
  moveClicksByID = new Map();
  for(const [moveID, clicks] of currentBatch.entries()) {
    sendCommand({clicks, cmd: 'move', move_id: moveID});
  }
}

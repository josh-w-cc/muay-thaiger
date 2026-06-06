import {createCommandError} from './command-errors.js';
// Limit per-message click bursts to keep move processing bounded server-side.
const MAX_MOVE_CLICKS = 200;

export function normalizeMoveMessage(message) {
  return {
    clicks: normalizeMoveClicks(message?.clicks),
    moveID: normalizeMoveID(message?.move_id),
  };
}

function normalizeMoveID(rawMoveID) {
  const moveID = Number(rawMoveID);
  if(!Number.isInteger(moveID)) {
    throw createCommandError('invalid-move-message');
  }
  return moveID;
}

function normalizeMoveClicks(rawClicks) {
  const clicks = Number(rawClicks ?? 1);
  if(!Number.isInteger(clicks)) {
    throw createCommandError('invalid-move-message');
  }
  if(clicks < 1 || clicks > MAX_MOVE_CLICKS) {
    throw createCommandError('invalid-move-message');
  }
  return clicks;
}

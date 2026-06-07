import {createCommandError} from './command-errors.js';
const MAX_MOVES_PER_MESSAGE = 200;

export function normalizeMoveMessage(message) {
  if(!message || typeof message !== 'object') {
    throw createCommandError('invalid-move-message');
  }
  const moveEntries = normalizeMoveList(message?.moves);
  return {
    moveIDs: moveEntries.map(({moveID}) => moveID),
  };
}

function normalizeMoveList(moves) {
  if(!Array.isArray(moves)) {
    throw createCommandError('invalid-move-message');
  }
  validateMoveListSize(moves.length);
  return moves.map(normalizeMoveListEntry);
}

function validateMoveListSize(moveListLength) {
  if(moveListLength < 1 || moveListLength > MAX_MOVES_PER_MESSAGE) {
    throw createCommandError('invalid-move-message');
  }
}

function normalizeMoveListEntry(move) {
  return {
    moveID: normalizeMoveID(move?.move_id),
    moveNum: normalizeMoveNum(move?.move_num),
  };
}

function normalizeMoveID(rawMoveID) {
  const moveID = Number(rawMoveID);
  if(!Number.isInteger(moveID)) {
    throw createCommandError('invalid-move-message');
  }
  return moveID;
}

function normalizeMoveNum(rawMoveNum) {
  const moveNum = Number(rawMoveNum);
  if(!Number.isInteger(moveNum) || moveNum < 0) {
    throw createCommandError('invalid-move-message');
  }
  return moveNum;
}

import {createCommandError} from './command-errors.js';
const MAX_MOVES_PER_MESSAGE = 200;

export function normalizeMoveMessage(message) {
  const moveEntries = normalizeMoveEntries(message);
  return {
    moveIDs: moveEntries.map(({moveID}) => moveID),
  };
}

function normalizeMoveEntries(message) {
  if(message?.moves === undefined) {
    return normalizeLegacyMoveEntries(message);
  }
  if(!Array.isArray(message.moves)) {
    throw createCommandError('invalid-move-message');
  }
  return normalizeMoveList(message.moves);
}

function normalizeLegacyMoveEntries(message) {
  const moveID = normalizeMoveID(message?.move_id);
  const clicks = normalizeMoveClicks(message?.clicks);
  return Array.from({length: clicks}, () => ({moveID}));
}

function normalizeMoveList(moves) {
  validateMoveListSize(moves.length);
  const normalizedMoves = moves.map(normalizeMoveListEntry);
  validateMoveNumSequence(normalizedMoves);
  return normalizedMoves;
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

function validateMoveNumSequence(normalizedMoves) {
  for(let moveIndex = 1; moveIndex < normalizedMoves.length; moveIndex += 1) {
    const previousMoveNum = normalizedMoves[moveIndex - 1].moveNum;
    const currentMoveNum = normalizedMoves[moveIndex].moveNum;
    if(currentMoveNum !== previousMoveNum + 1) {
      throw createCommandError('invalid-move-message');
    }
  }
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
  if(clicks < 1 || clicks > MAX_MOVES_PER_MESSAGE) {
    throw createCommandError('invalid-move-message');
  }
  return clicks;
}

function normalizeMoveNum(rawMoveNum) {
  const moveNum = Number(rawMoveNum);
  if(!Number.isInteger(moveNum) || moveNum < 0) {
    throw createCommandError('invalid-move-message');
  }
  return moveNum;
}

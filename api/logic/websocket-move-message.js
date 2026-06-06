import {createCommandError} from './command-errors.js';
const MAX_MOVES_PER_MESSAGE = 200;

export function normalizeMoveMessage(message) {
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

function normalizeMoveNum(rawMoveNum) {
  const moveNum = Number(rawMoveNum);
  if(!Number.isInteger(moveNum) || moveNum < 0) {
    throw createCommandError('invalid-move-message');
  }
  return moveNum;
}

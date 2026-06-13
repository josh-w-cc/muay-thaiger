export const MOVE_CLICK_BATCH_MILLISECONDS = 500;
let moveCount = 0;

export function createMoveNum() {
  const nextMoveNum = moveCount;
  moveCount += 1;
  return nextMoveNum;
}

export function syncMoveCount(fight) {
  const maxMoveNum = getMaxMoveNum(fight);
  if(maxMoveNum >= moveCount) {
    moveCount = maxMoveNum + 1;
  }
}

function getMaxMoveNum(fight) {
  const moveList = getAttackerMoveList(fight);
  if(!Array.isArray(moveList) || moveList.length === 0) {
    return -1;
  }
  return Math.max(...moveList);
}

function getAttackerMoveList(fight) {
  if(!fight || !fight.details || !fight.details.attacker) {
    return null;
  }
  return fight.details.attacker.moveList;
}

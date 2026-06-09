import {executeFightMove, getMoveDefinition, markMoveUsed} from './fight-judge-utils.js';

const IDLE_RECOVERY_BUFFER_SECONDS = 1;

export function executeFightAction(participantFight, activeParticipant, move, moveDefinition, moveNum = null) {
  if(!markMoveUsed(move, moveDefinition, activeParticipant)) {
    return false;
  }
  if(Number.isInteger(moveNum)) {
    activeParticipant.moveList.push(moveNum);
  }
  const damage = executeFightMove(moveDefinition, activeParticipant, getOpponentParticipant(participantFight));
  participantFight.fight.details.feed.push(
    {actorRole: participantFight.role, attacker: activeParticipant.name, move: moveDefinition.name, result: `${damage} damage`},
  );
  return true;
}

export function applyIdleAttacks(fight) {
  applyIdleParticipantAttacks(fight, 'attacker');
  applyIdleParticipantAttacks(fight, 'defender');
}

function applyIdleParticipantAttacks(fight, participantRole) {
  const participantFight = {fight, role: participantRole};
  const activeParticipant = fight.details?.[participantRole];
  if(!canApplyIdleParticipant(activeParticipant)) {
    return;
  }
  for(const move of activeParticipant.moves) {
    applyIdleMove(participantFight, activeParticipant, move);
  }
}

function applyIdleMove(participantFight, activeParticipant, move) {
  const moveDefinition = getMoveDefinition(move.id);
  if(canApplyIdleMove(move, moveDefinition)) {
    executeFightAction(participantFight, activeParticipant, move, moveDefinition);
  }
}

function canApplyIdleMove(move, moveDefinition) {
  if(move.lastUsed == null) {
    return true;
  }
  const now = Date.now();
  return move.lastUsed < (now - ((moveDefinition.recovery + IDLE_RECOVERY_BUFFER_SECONDS) * 1000));
}

function getOpponentParticipant(participantFight) {
  return participantFight.fight.details[participantFight.role === 'attacker' ? 'defender' : 'attacker'];
}

function canApplyIdleParticipant(participant) {
  return Boolean(participant && Array.isArray(participant.moves));
}

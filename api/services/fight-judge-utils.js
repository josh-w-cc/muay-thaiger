import {MOVE_DEFINITIONS_BY_ID} from 'shared/moves.js';

export async function getFightParticipants(fighters, fight) {
  const participants = await Promise.all([
    getFightParticipant(fighters, fight?.attacker, 'attacker'),
    getFightParticipant(fighters, fight?.defender, 'defender'),
  ]);
  const validParticipants = participants.filter((participant) => participant != null);
  const uniqueByPlayerID = new Map(validParticipants.map((participant) => [participant.playerID, participant]));
  return [...uniqueByPlayerID.values()];
}

export function calculateFighterHealth({constitution, durability}) {
  return constitution * constitution * durability;
}

export function calculateFighterStats({agility, reach, skill, stamina, strength}) {
  const staminaLogApprox = stamina.logApprox();
  const agilityLogApprox = agility.logApprox();
  return {
    attack: skill + staminaLogApprox + agilityLogApprox.logApprox() + reach,
    defense: skill + agilityLogApprox + staminaLogApprox.logApprox(),
    power: (strength + skill.logApprox()) * staminaLogApprox,
  };
}

export function getMoveDefinition(moveID) {
  const moveDefinition = MOVE_DEFINITIONS_BY_ID[moveID];
  if(!moveDefinition) {
    throw new Error(`Unknown move:${moveID}`);
  }
  return moveDefinition;
}

export function executeFightMove(moveDefinition, activeParticipant, opponentParticipant) {
  const attackerPower = activeParticipant?.stats ? calculateFighterStats(activeParticipant.stats).power : 1n;
  moveDefinition.affect(
    createMoveActor(activeParticipant),
    createMoveActor(opponentParticipant, attackerPower),
  );
}

export function isMoveInRecovery(move, moveDefinition, now) {
  return move.lastUsed != null && move.lastUsed > now - moveDefinition.recovery * 1000;
}

export function applyMoveStaminaCost(participant, moveDefinition) {
  const staminaCost = divideAndRoundUp(participant.stats.stamina * BigInt(moveDefinition.staminaCost), 100n);
  participant.stats.stamina -= staminaCost;
}

export function applyMoveStaminaCostIfNeeded(move, moveDefinition, participant, now) {
  if(isMoveInRecovery(move, moveDefinition, now)) {
    applyMoveStaminaCost(participant, moveDefinition);
  }
}

export function getFightMove(participantFight, moveID) {
  const moves = participantFight.fight.details[participantFight.role].moves;
  return moves.find(({id}) => id === moveID) || null;
}

function createMoveActor(participant, incomingDamageScale = 1n) {
  return {
    takeDamage: (amount) => {
      participant.stats.health -= BigInt(amount) * incomingDamageScale;
    },
  };
}

async function getFightParticipant(fighters, fighterID, role) {
  if(fighterID == null) {
    return null;
  }
  const fighter = await fighters.find(fighterID);
  if(fighter?.player == null) {
    return null;
  }
  return {playerID: fighter.player, role};
}

function divideAndRoundUp(value, divisor) {
  return (value + divisor - 1n) / divisor;
}

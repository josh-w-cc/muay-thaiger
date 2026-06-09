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

export function markMoveUsed(move, moveDefinition, activeParticipant) {
  const now = Date.now();
  const currentStamina = activeParticipant.stats.stamina;
  if(currentStamina < 0n) {
    return false;
  }
  if(move.lastUsed != null && move.lastUsed > (now - (moveDefinition.recovery * 1000))) {
    const maxStamina = activeParticipant.startingStats?.stamina ?? currentStamina;
    const staminaCost = (maxStamina * BigInt(moveDefinition.staminaCost)) / 100n;
    const remainingStamina = currentStamina - staminaCost;
    if(remainingStamina < 0n) {
      return false;
    }
    activeParticipant.stats.stamina = remainingStamina;
  }
  move.lastUsed = now;
  return true;
}

export function executeFightMove(moveDefinition, activeParticipant, opponentParticipant) {
  const attackerPower = activeParticipant?.stats ? calculateFighterStats(activeParticipant.stats).power : 1n;
  let damage = 0n;
  moveDefinition.affect(
    createMoveActor(activeParticipant),
    createMoveActor(opponentParticipant, attackerPower, (d) => { damage += d; }),
  );
  return damage;
}

function createMoveActor(participant, incomingDamageScale = 1n, onDamage = null) {
  return {
    takeDamage: (amount) => {
      const damage = BigInt(amount) * incomingDamageScale;
      participant.stats.health -= damage;
      onDamage?.(damage);
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
  return {playerID: fighter.player, role, displayName: fighter.display_name};
}

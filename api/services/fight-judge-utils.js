import {MOVE_DEFINITIONS, MOVE_IDS} from 'shared/moves.js';

export async function getFightParticipants(fighters, fight) {
  const participants = await Promise.all([
    getFightParticipant(fighters, fight?.attacker, 'attacker'),
    getFightParticipant(fighters, fight?.defender, 'defender'),
  ]);
  const validParticipants = participants.filter((participant) => participant != null);
  const uniqueByPlayerID = new Map(validParticipants.map((participant) => [participant.playerID, participant]));
  return [...uniqueByPlayerID.values()];
}

export function calculateFighterStats({agility, constitution, durability, reach, skill, stamina, strength}) {
  const staminaLogApprox = stamina.logApprox();
  const agilityLogApprox = agility.logApprox();
  return {
    attack: skill + staminaLogApprox + agilityLogApprox.logApprox() + reach,
    defense: skill + agilityLogApprox + staminaLogApprox.logApprox(),
    health: constitution * constitution * durability,
    power: (strength + skill.logApprox()) * staminaLogApprox,
  };
}

export function getMoveDefinition(moveID) {
  const moveName = Object.entries(MOVE_IDS).find(([, id]) => id === moveID)?.[0];
  if(!moveName || !MOVE_DEFINITIONS[moveName]) {
    throw new Error(`Unknown move:${moveID}`);
  }
  return MOVE_DEFINITIONS[moveName];
}

export function executeFightMove(moveDefinition, activeParticipant, opponentParticipant) {
  if(!moveDefinition?.affect) {
    return;
  }
  moveDefinition.affect(
    createMoveActor(activeParticipant),
    createMoveActor(opponentParticipant),
  );
}

function createMoveActor(participant) {
  return {
    takeDamage: (amount) => {
      if(!participant?.stats) {
        return;
      }
      participant.stats.health -= BigInt(amount);
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

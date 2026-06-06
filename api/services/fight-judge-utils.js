import {MOVE_DEFINITIONS, MOVE_IDS} from 'shared/moves.js';

const MOVE_DEFINITIONS_BY_ID = Object.freeze(
  Object.fromEntries(
    Object.entries(MOVE_IDS)
      .map(([name, id]) => [id, MOVE_DEFINITIONS[name]])
      .filter(([, moveDefinition]) => Boolean(moveDefinition)),
  ),
);

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
  const moveDefinition = MOVE_DEFINITIONS_BY_ID[moveID];
  if(!moveDefinition) {
    throw new Error(`Unknown move:${moveID}`);
  }
  return moveDefinition;
}

export function executeFightMove(moveDefinition, activeParticipant, opponentParticipant) {
  if(!moveDefinition?.affect) {
    return;
  }
  const attackerPower = activeParticipant?.stats ? calculateFighterStats(activeParticipant.stats).power : 1n;
  moveDefinition.affect(
    createMoveActor(activeParticipant),
    createMoveActor(opponentParticipant, attackerPower),
  );
}

function createMoveActor(participant, incomingDamageScale = 1n) {
  return {
    takeDamage: (amount) => {
      if(!participant?.stats) {
        return;
      }
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

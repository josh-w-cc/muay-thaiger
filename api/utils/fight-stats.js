import 'shared/bigInt.js';

const PARTICIPANT_STAT_KEYS = ['agility', 'constitution', 'durability', 'reach', 'skill', 'stamina', 'strength'];

export function calculateParticipantStats(participant) {
  const agility = getParticipantStat(participant, 'agility');
  const constitution = getParticipantStat(participant, 'constitution');
  const durability = getParticipantStat(participant, 'durability');
  const reach = getParticipantStat(participant, 'reach');
  const skill = getParticipantStat(participant, 'skill');
  const stamina = getParticipantStat(participant, 'stamina');
  const strength = getParticipantStat(participant, 'strength');

  return {
    attack: skill + stamina.logApprox() + agility.logApprox().logApprox() + reach,
    defense: skill + agility.logApprox() + stamina.logApprox().logApprox(),
    health: constitution * constitution * durability,
    power: (strength + skill.logApprox()) * stamina.logApprox(),
  };
}

export function hasParticipantStats(participant) {
  return PARTICIPANT_STAT_KEYS.some((stat) => hasStat(participant, stat));
}

function getParticipantStat(participant, stat) {
  return toBigInt(readParticipantStat(participant, stat));
}

function hasStat(participant, stat) {
  return readParticipantStat(participant, stat) != null;
}

function readParticipantStat(participant, stat) {
  if(participant == null) {
    return null;
  }

  const directValue = participant[stat];
  if(directValue != null) {
    return directValue;
  }

  if(participant.stats == null) {
    return null;
  }

  return participant.stats[stat] ?? null;
}

function toBigInt(value) {
  try {
    return BigInt(value ?? 0);
  }
  catch {
    return 0n;
  }
}

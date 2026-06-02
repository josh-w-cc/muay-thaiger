export function serializeFightCreate({attacker, defender, rank, reason}) {
  const serializedAttacker = serializeParticipant(attacker);
  const serializedDefender = serializeParticipant(defender);
  if(!hasStats(serializedAttacker.details.stats)) {
    throw new TypeError('invalid-fight-stats');
  }

  return {
    attacker: serializedAttacker.id,
    defender: serializedDefender.id,
    details: serializeFightDetails(serializedAttacker.details, serializedDefender.details),
    rank,
    reason,
  };
}

function serializeParticipant(participant) {
  return {
    details: serializeParticipantDetails(participant?.stats),
    id: participant?.id ?? null,
  };
}

function serializeFightDetails(attacker, defender) {
  if(!hasStats(defender.stats)) {
    return {attacker};
  }

  return {attacker, defender};
}

function serializeParticipantDetails(stats) {
  return {
    starting_stats: serializeStats(stats),
    stats: serializeStats(stats),
  };
}

function hasStats(stats) {
  if(!stats || typeof stats !== 'object' || Array.isArray(stats)) {
    return false;
  }

  return Object.keys(stats).length > 0;
}

function serializeStats(stats) {
  if(!stats || typeof stats !== 'object' || Array.isArray(stats)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(stats).map(([key, value]) => [key, value.toString()]),
  );
}

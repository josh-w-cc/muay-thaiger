import {create} from 'zustand';
import {parseBigIntStats} from 'shared/stats.js';

const useFightStore = create((set) => createFightState(set));

export default useFightStore;

export function resetFightStore() {
  useFightStore.setState(createFightState(useFightStore.setState), true);
}

function createFightState(set, fight = null) {
  return {
    ...getServerFightState(fight),
    syncServerState: (nextFight) => set(createFightState(set, nextFight), true),
  };
}

function getInitialFightState() {
  return {
    attacker: null,
    created_at: null,
    defender: null,
    details: null,
    id: null,
    rank: null,
    reason: null,
    updated_at: null,
    victory: null,
  };
}

function getServerFightState(fight) {
  if(!fight || typeof fight !== 'object') {
    return getInitialFightState();
  }
  return {
    ...getInitialFightState(),
    ...fight,
    details: parseFightDetails(fight.details),
  };
}

function parseFightDetails(details) {
  return mapParsedFields(details, ['attacker', 'defender'], parseFightParticipant);
}

function parseFightParticipant(participant) {
  return mapParsedFields(participant, ['startingStats', 'standardStats', 'calculatedStats', 'stats'], parseFightStats);
}

function parseFightStats(stats) {
  if(!isObject(stats)) {
    return stats ?? null;
  }
  return parseBigIntStats(stats);
}

function mapParsedFields(source, keys, parser) {
  if(!isObject(source)) {
    return source ?? null;
  }
  const result = {...source};
  for(const key of keys) {
    if(key in source) {
      result[key] = parser(source[key]);
    }
  }
  return result;
}

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

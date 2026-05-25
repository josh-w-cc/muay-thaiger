import {RACES} from 'shared/races.js';

import {getSelectionState} from './fighterState.js';


const defaultRace = `${RACES[0].id}`;

export function buildStateFromServerFighter(fighter) {
  const race = getServerRace(fighter);
  return {
    ...getSelectionState(race),
    ...getServerStats(fighter),
    createdAt: getServerCreatedAt(fighter),
    displayName: getServerDisplayName(fighter),
    gold: getServerGold(fighter),
    id: getServerID(fighter),
    idling: false,
    race,
  };
}

function getServerCreatedAt(fighter) {
  if(fighter?.created_at) {
    return fighter.created_at;
  }
  return null;
}

function getServerDisplayName(fighter) {
  if(typeof fighter?.display_name === 'string' && fighter.display_name) {
    return fighter.display_name;
  }
  return '';
}

function getServerGold(fighter) {
  const nextGold = toBigInt(fighter?.gold);
  if(nextGold !== null) {
    return nextGold;
  }
  return 0n;
}

function getServerID(fighter) {
  if(Number.isInteger(fighter?.id)) {
    return fighter.id;
  }
  return null;
}

function getServerRace(fighter) {
  if(fighter?.race) {
    return `${fighter.race}`;
  }
  return defaultRace;
}

function getServerStats(fighter) {
  if(!fighter?.stats || typeof fighter.stats !== 'object') {
    return {};
  }
  return Object.fromEntries(
    Object.entries(fighter.stats)
      .map(([key, value]) => [key, toBigInt(value)])
      .filter(([, value]) => value !== null),
  );
}

function toBigInt(value) {
  if(typeof value === 'bigint') {
    return value;
  }
  if(typeof value === 'number' && Number.isInteger(value)) {
    return BigInt(value);
  }
  if(typeof value === 'string' && /^-?\d+$/.test(value)) {
    return BigInt(value);
  }
  return null;
}

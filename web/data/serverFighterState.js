import {RACES} from './baseStats.js';
import {getSelectionState} from './fighterState.js';


const defaultRace = `${RACES[0].id}`;

export function buildStateFromServerFighter(fighter) {
  const race = getServerRace(fighter);
  return {
    ...getSelectionState(race),
    ...getServerStats(fighter),
    gold: getServerGold(fighter),
    id: getServerID(fighter),
    idling: false,
    race,
  };
}

function getServerGold(fighter) {
  const nextGold = Number(fighter?.gold);
  if(Number.isFinite(nextGold)) {
    return nextGold;
  }
  return 0;
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
  if(fighter?.stats) {
    return fighter.stats;
  }
  return {};
}

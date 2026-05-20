import {RACES} from './baseStats.js';
import {getSelectionState} from './fighterState.js';


const initialRace = `${RACES[0].id}`;

export function getSocketOverwriteState({fighter}) {
  const race = getSocketRace(fighter);
  return {
    ...getSelectionState(race),
    ...getSocketStats(fighter),
    gold: getSocketGold(fighter),
    id: getSocketID(fighter),
    idling: false,
    race,
  };
}

function getSocketGold(fighter) {
  const nextGold = Number(fighter?.gold);
  if(Number.isFinite(nextGold)) {
    return nextGold;
  }
  return 0;
}

function getSocketID(fighter) {
  if(Number.isInteger(fighter?.id)) {
    return fighter.id;
  }
  return null;
}

function getSocketRace(fighter) {
  if(fighter?.race) {
    return `${fighter.race}`;
  }
  return initialRace;
}

function getSocketStats(fighter) {
  if(fighter?.stats) {
    return fighter.stats;
  }
  return {};
}

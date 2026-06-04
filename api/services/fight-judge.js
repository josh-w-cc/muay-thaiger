import fightersModel from '../data/models/fighters.js';
import fightsModel from '../data/models/fights/index.js';
import {calculateParticipantStats, hasParticipantStats} from '../utils/fight-stats.js';


export class FightJudge {
  #fightsByPlayerID = new Map();
  #fighters = null;

  async load({fighters, fights}) {
    this.#fightsByPlayerID.clear();
    this.#fighters = fighters;

    const unresolvedFights = await fights.listUnresolved();
    for(const fight of unresolvedFights) {
      await this.attach(fighters, fight);
    }
  }

  async attach(fighters, fight) {
    this.#fighters = fighters;
    const playerIDs = await getFightPlayerIDs(fighters, fight);
    for(const playerID of playerIDs) {
      if(this.#fightsByPlayerID.has(playerID)) {
        continue;
      }
      this.#fightsByPlayerID.set(playerID, fight);
    }
  }

  async get(playerID) {
    const fight = this.#fightsByPlayerID.get(playerID) ?? null;
    if(!fight || !this.#fighters || !fight.details) {
      return fight;
    }

    return hydrateFight(fight, await getCurrentFightParticipants(this.#fighters, fight));
  }
}

export function attachFightJudge(app) {
  const judge = new FightJudge();
  const models = {fighters: fightersModel(app.db), fights: fightsModel(app.db)};

  app.decorate('fightJudge', judge);
  app.addHook('onReady', () => judge.load(models));
}

async function getFightPlayerIDs(fighters, fight) {
  const fighterIDs = [...new Set([fight?.attacker, fight?.defender].filter((fighterID) => fighterID != null))];
  const fighterRows = await Promise.all(fighterIDs.map((fighterID) => fighters.find(fighterID)));

  return [...new Set(
    fighterRows
      .map((fighter) => fighter?.player)
      .filter((playerID) => playerID != null),
  )];
}

async function getCurrentFightParticipants(fighters, fight) {
  const [attacker, defender] = await Promise.all([
    getCurrentFightParticipant(fighters, fight, 'attacker'),
    getCurrentFightParticipant(fighters, fight, 'defender'),
  ]);

  return {attacker, defender};
}

async function getCurrentFightParticipant(fighters, fight, key) {
  const fighterID = fight?.[key];
  if(fighterID == null) {
    return null;
  }

  return fighters.find(fighterID);
}

function hydrateFight(fight, currentParticipants) {
  return {
    ...fight,
    details: hydrateFightDetails(fight, currentParticipants),
  };
}

function hydrateFightDetails(fight, currentParticipants) {
  const details = {...fight.details};
  applyParticipantHydration(details, fight, currentParticipants, 'attacker');
  applyParticipantHydration(details, fight, currentParticipants, 'defender');
  return details;
}

function applyParticipantHydration(details, fight, currentParticipants, key) {
  if(!(key in details)) {
    return;
  }

  details[key] = hydrateFightParticipant(fight.details[key], currentParticipants[key]);
}

function hydrateFightParticipant(participant, currentFighter) {
  if(!participant) {
    return participant;
  }

  const calculationSource = hasParticipantStats(currentFighter)
    ? currentFighter
    : participant;

  return {
    ...participant,
    ...calculateParticipantStats(calculationSource),
  };
}

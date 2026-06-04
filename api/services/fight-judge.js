import fightersModel from '../data/models/fighters.js';
import fightsModel from '../data/models/fights.js';


export class FightJudge {
  #fightsByPlayerID = new Map();

  async load({fighters, fights}) {
    this.#fightsByPlayerID.clear();

    const unresolvedFights = await fights.listUnresolved();
    for(const fight of unresolvedFights) {
      await this.attach(fighters, fight);
    }
  }

  async attach(fighters, fight) {
    const playerIDs = await getFightPlayerIDs(fighters, fight);
    for(const playerID of playerIDs) {
      if(this.#fightsByPlayerID.has(playerID)) {
        continue;
      }
      this.#fightsByPlayerID.set(playerID, fight);
    }
  }

  get(playerID) {
    const fight = this.#fightsByPlayerID.get(playerID) ?? null;
    if(!fight) {
      return null;
    }
    applyCalculatedStats(fight);
    return fight;
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

function applyCalculatedStats(fight) {
  applyCalculatedStatsToParticipant(fight?.details?.attacker);
  applyCalculatedStatsToParticipant(fight?.details?.defender);
}

function applyCalculatedStatsToParticipant(participant) {
  if(!participant?.stats) {
    return;
  }
  participant.calculated_stats = calculateStats(participant.stats);
}

function calculateStats(stats) {
  const agility = Number(stats.agility);
  const constitution = Number(stats.constitution);
  const durability = Number(stats.durability);
  const reach = Number(stats.reach);
  const skill = Number(stats.skill);
  const stamina = Number(stats.stamina);
  const strength = Number(stats.strength);

  return {
    attack: skill + Math.log(stamina) + Math.log(Math.log(agility)) + reach,
    defense: skill + Math.log(agility) + Math.log(Math.log(stamina)),
    health: constitution * constitution * durability,
    power: (strength + Math.log(skill)) * Math.log(stamina),
  };
}

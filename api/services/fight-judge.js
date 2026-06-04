import 'shared/bigInt.js';
import fightersModel from '../data/models/fighters.js';
import fightsModel from '../data/models/fights/index.js';


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
    const fight = this.#fightsByPlayerID.get(playerID);
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
  const attacker = fight?.details?.attacker;
  const defender = fight?.details?.defender;

  applyCalculatedStatsToParticipant(attacker, true);
  applyCalculatedStatsToParticipant(defender, false);
}

function applyCalculatedStatsToParticipant(participant, required) {
  if(!participant) {
    if(required) {
      throw new TypeError('invalid-fight-stats');
    }
    return;
  }

  if(!participant.stats) {
    throw new TypeError('invalid-fight-stats');
  }

  participant.calculated_stats = calculateStats(participant.stats);
}

function calculateStats(stats) {
  const agility = parseBigIntStat(stats, 'agility');
  const constitution = parseBigIntStat(stats, 'constitution');
  const durability = parseBigIntStat(stats, 'durability');
  const reach = parseBigIntStat(stats, 'reach');
  const skill = parseBigIntStat(stats, 'skill');
  const stamina = parseBigIntStat(stats, 'stamina');
  const strength = parseBigIntStat(stats, 'strength');

  return {
    attack: skill + stamina.logApprox() + agility.logApprox().logApprox() + reach,
    defense: skill + agility.logApprox() + stamina.logApprox().logApprox(),
    health: constitution * constitution * durability,
    power: (strength + skill.logApprox()) * stamina.logApprox(),
  };
}

function parseBigIntStat(stats, statName) {
  if(stats[statName] === null || stats[statName] === undefined) {
    throw new TypeError('invalid-fight-stats');
  }
  return BigInt(stats[statName]);
}

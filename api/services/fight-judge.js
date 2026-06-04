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
    const fightWithStartingStats = {
      ...fight,
      startingStats: captureStartingStats(fight),
    };
    for(const playerID of playerIDs) {
      if(this.#fightsByPlayerID.has(playerID)) {
        continue;
      }
      this.#fightsByPlayerID.set(playerID, fightWithStartingStats);
    }
  }

  get(playerID) {
    return this.#fightsByPlayerID.get(playerID) ?? null;
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

function captureStartingStats(fight) {
  return {
    attacker: fight.details.attacker.stats,
    defender: fight.details?.defender?.stats ?? null,
  };
}

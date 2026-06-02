import fightersModel from '../data/models/fighters.js';
import fightsModel from '../data/models/fights.js';


export class FightJudge {
  #fightsByPlayerID = new Map();

  async load({fighters, fights}) {
    this.#fightsByPlayerID.clear();

    const unresolvedFights = await fights.listUnresolved();
    for(const fight of unresolvedFights) {
      const playerIDs = await getFightPlayerIDs(fighters, fight);
      for(const playerID of playerIDs) {
        if(this.#fightsByPlayerID.has(playerID)) {
          continue;
        }
        this.#fightsByPlayerID.set(playerID, fight);
      }
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

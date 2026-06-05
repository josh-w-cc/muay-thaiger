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
    const enrichedFight = captureStartingStats(fight);
    for(const playerID of playerIDs) {
      this.#fightsByPlayerID.set(playerID, enrichedFight);
    }
  }

  get(playerID) {
    const fight = this.#fightsByPlayerID.get(playerID);
    if(!fight) {
      return null;
    }
    return getCalculatedFight(fight);
  }
}

function getCalculatedFight(fight) {
  const {attacker, defender, ...rest} = fight.details;
  return {
    ...fight,
    details: {
      attacker: {
        ...attacker,
        calculatedStats: calculateFighterStats(attacker.stats),
      },
      ...(defender ? {
        defender: {
          ...defender,
          calculatedStats: calculateFighterStats(defender.stats),
        }
      } : {}),
      ...rest,
    },
  };
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
  const playerIDs = fighterRows.map((fighter) => fighter?.player).filter((playerID) => playerID != null);
  return [...new Set(playerIDs)];
}

function captureStartingStats(fight) {
  const {attacker, defender, ...rest} = fight.details;
  return {
    ...fight,
    details: {
      attacker: {
        ...attacker,
        startingStats: {...attacker.stats},
      },
      ...(defender ? {
        defender: {
          ...defender,
          startingStats: {...defender.stats},
        }
      } : {}),
      ...rest,
    }
  };
}

function calculateFighterStats({agility, constitution, durability, reach, skill, stamina, strength}) {
  const staminaLogApprox = stamina.logApprox();
  const agilityLogApprox = agility.logApprox();
  return {
    attack: skill + staminaLogApprox + agilityLogApprox.logApprox() + reach,
    defense: skill + agilityLogApprox + staminaLogApprox.logApprox(),
    health: constitution * constitution * durability,
    power: (strength + skill.logApprox()) * staminaLogApprox,
  };
}

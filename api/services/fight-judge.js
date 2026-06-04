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
    const {attacker, defender, ...rest} = fight;
    const enrichedFight = {
      ...rest,
      ...captureStartingStats(fight),
    };
    for(const playerID of playerIDs) {
      if(this.#fightsByPlayerID.has(playerID)) {
        continue;
      }
      this.#fightsByPlayerID.set(playerID, enrichedFight);
    }
  }

  get(playerID) {
    const fight = this.#fightsByPlayerID.get(playerID);
    if(!fight) {
      return null;
    }
    return captureCalculatedFight(fight, captureCalculatedStats(fight));
  }
}

function captureCalculatedFight(fight, calculatedStats) {
  const result = {
    ...fight,
    attacker: {
      ...fight.attacker,
      ...calculatedStats.attacker,
    },
  };
  if(fight.defender) {
    result.defender = {...fight.defender, ...calculatedStats.defender};
  }
  return result;
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
  return {
    attacker: {startingStats: {...fight.details.attacker.stats}},
    ...(fight.details.defender ? {defender: {startingStats: {...fight.details.defender.stats}}} : {}),
  };
}

function captureCalculatedStats(fight) {
  return {
    attacker: {calculatedStats: calculateFighterStats(fight.details.attacker.stats)},
    ...(fight.details.defender ? {defender: {calculatedStats: calculateFighterStats(fight.details.defender.stats)}} : {}),
  };
}

function calculateFighterStats({agility, constitution, durability, reach, skill, stamina, strength}) {
  const agilityValue = toBigIntOrZero(agility);
  const constitutionValue = toBigIntOrZero(constitution);
  const durabilityValue = toBigIntOrZero(durability);
  const reachValue = toBigIntOrZero(reach);
  const skillValue = toBigIntOrZero(skill);
  const staminaValue = toBigIntOrZero(stamina);
  const strengthValue = toBigIntOrZero(strength);
  const staminaLogApprox = staminaValue.logApprox();
  const agilityLogApprox = agilityValue.logApprox();
  return {
    attack: skillValue + staminaLogApprox + agilityLogApprox.logApprox() + reachValue,
    defense: skillValue + agilityLogApprox + staminaLogApprox.logApprox(),
    health: constitutionValue * constitutionValue * durabilityValue,
    power: (strengthValue + skillValue.logApprox()) * staminaLogApprox,
  };
}
function toBigIntOrZero(value) {
  return BigInt(value ?? 0);
}

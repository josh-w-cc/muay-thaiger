import fightersModel from '../data/models/fighters.js';
import fightsModel from '../data/models/fights/index.js';
import {calculateFighterStats, getFightParticipants} from './fight-judge-utils.js';

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
    const participants = await getFightParticipants(fighters, fight);
    const enrichedFight = captureStartingStats(fight);
    for(const participant of participants) {
      this.#fightsByPlayerID.set(participant.playerID, {fight: enrichedFight, role: participant.role});
    }
  }

  get(playerID) {
    const participantFight = this.#fightsByPlayerID.get(playerID);
    return participantFight ? getCalculatedFight(participantFight.fight) : null;
  }

  move(playerID, moveID) {
    const move = getFightMove(this.#fightsByPlayerID.get(playerID), moveID);
    if(!move) {
      return false;
    }
    move.lastUsed = Math.floor(Date.now() / 1000);
    return true;
  }
}

function getCalculatedFight(fight) {
  const {attacker, defender, ...rest} = fight.details;
  return {
    ...fight,
    details: {
      attacker: addCalculatedStats(attacker),
      ...(defender ? {defender: addCalculatedStats(defender)} : {}),
      ...rest,
    },
  };
}

function addCalculatedStats(participant) {
  const calculatedStats = calculateFighterStats(participant.stats);
  return {...participant, calculatedStats, stats: {...participant.stats, ...calculatedStats}};
}

export function attachFightJudge(app) {
  const judge = new FightJudge();
  const models = {fighters: fightersModel(app.db), fights: fightsModel(app.db)};
  app.decorate('fightJudge', judge);
  app.addHook('onReady', () => judge.load(models));
}

function captureStartingStats(fight) {
  const {attacker, defender, ...rest} = fight.details;
  return {
    ...fight,
    details: {
      attacker: addStartingStats(attacker),
      ...(defender ? {defender: addStartingStats(defender)} : {}),
      ...rest,
    },
  };
}

function addStartingStats(participant) {
  return {
    ...participant,
    startingStats: {
      ...participant.stats,
      health: calculateFighterStats(participant.stats).health,
    },
  };
}

function getFightMove(participantFight, moveID) {
  if(!participantFight) {
    return null;
  }
  const moves = participantFight.fight.details[participantFight.role].moves;
  return moves.find(({id}) => id === moveID) || null;
}

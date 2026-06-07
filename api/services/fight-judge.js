import fightersModel from '../data/models/fighters.js';
import fightsModel from '../data/models/fights/index.js';
import {calculateFighterHealth, calculateFighterStats, executeFightMove, getFightParticipants, getMoveDefinition} from './fight-judge-utils.js';

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
      enrichedFight.details[participant.role].name = participant.displayName;
      this.#fightsByPlayerID.set(participant.playerID, {fight: enrichedFight, role: participant.role});
    }
  }

  get(playerID) {
    const participantFight = this.#fightsByPlayerID.get(playerID);
    return participantFight ? getCalculatedFight(participantFight.fight) : null;
  }

  move(playerID, moveID) {
    const participantFight = this.#fightsByPlayerID.get(playerID);
    if(!participantFight) {
      throw new Error(`No fight for player:${playerID}`);
    }
    const move = getFightMove(participantFight, moveID);
    if(!move) {
      throw new Error(`Unknown move:${moveID}`);
    }
    const moveDefinition = getMoveDefinition(moveID);
    move.lastUsed = Date.now();
    const activeParticipant = participantFight.fight.details[participantFight.role];
    const opponentRole = participantFight.role === 'attacker' ? 'defender' : 'attacker';
    const damage = executeFightMove(moveDefinition, activeParticipant, participantFight.fight.details[opponentRole]);
    activeParticipant.moveCount += 1;
    participantFight.fight.details.feed.push(`${activeParticipant.name} used ${moveDefinition.name}: ${damage} damage`);
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
  const stats = {...participant.stats, ...calculatedStats};
  return {...participant, stats};
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
      feed: [],
    },
  };
}

function addStartingStats(participant) {
  const health = calculateFighterHealth(participant.stats);
  participant.stats.health = health;
  return {
    ...participant,
    moveCount: 0,
    startingStats: {
      ...participant.stats,
      health,
    },
  };
}

function getFightMove(participantFight, moveID) {
  const moves = participantFight.fight.details[participantFight.role].moves;
  return moves.find(({id}) => id === moveID) || null;
}

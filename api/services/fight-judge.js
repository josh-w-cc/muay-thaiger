import fightersModel from '../data/models/fighters.js';
import fightsModel from '../data/models/fights/index.js';
import {calculateFighterHealth, calculateFighterStats, executeFightMove, getFightParticipants, getMoveDefinition,
  markMoveUsed} from './fight-judge-utils.js';

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
    return participantFight ? getCalculatedFight(participantFight.fight, participantFight.role) : null;
  }

  move(playerID, moveID, moveNum) {
    const participantFight = getParticipantFight(this.#fightsByPlayerID, playerID),
      activeParticipant = participantFight.fight.details[participantFight.role];
    if(activeParticipant.moveList.includes(moveNum)) {
      return false;
    }
    const move = getFightMoveOrThrow(participantFight, moveID),
      moveDefinition = getMoveDefinition(moveID);
    if(!markMoveUsed(move, moveDefinition, activeParticipant)) {
      return false;
    }
    activeParticipant.moveList.push(moveNum);
    const damage = executeFightMove(moveDefinition, activeParticipant, getOpponentParticipant(participantFight));
    participantFight.fight.details.feed.push(
      {actorRole: participantFight.role, attacker: activeParticipant.name, move: moveDefinition.name, result: `${damage} damage`},
    );
    return true;
  }
}

function getCalculatedFight(fight, participantRole) {
  const {attacker, defender, ...rest} = fight.details;
  const feed = rest.feed.map((entry) => ({...entry, isSelf: entry.actorRole === participantRole}));
  return {
    ...fight,
    details: {
      attacker: addCalculatedStats(attacker),
      ...(defender ? {defender: addCalculatedStats(defender)} : {}),
      ...rest,
      feed,
    },
  };
}

function addCalculatedStats(participant) {
  return {...participant, stats: {...participant.stats, ...calculateFighterStats(participant.stats)}};
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
    moveList: [],
    startingStats: {
      ...participant.stats,
      health,
    },
  };
}

const getFightMove = (participantFight, moveID) => participantFight.fight.details[participantFight.role].moves.find(({id}) => id === moveID) || null;

const getOpponentParticipant = (participantFight) => participantFight.fight.details[participantFight.role === 'attacker' ? 'defender' : 'attacker'];

function fail(message) {
  throw new Error(message);
}
const getFightMoveOrThrow = (participantFight, moveID) => getFightMove(participantFight, moveID) ?? fail(`Unknown move:${moveID}`);

function getParticipantFight(fightsByPlayerID, playerID) {
  return fightsByPlayerID.get(playerID) ?? fail(`No fight for player:${playerID}`);
}

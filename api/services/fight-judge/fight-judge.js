import fightersModel from '../../data/models/fighters.js';
import fightsModel from '../../data/models/fights/index.js';
import {executeFightAction, applyIdleAttacks} from './fight-judge-actions.js';
import {captureStartingStats} from '../fight-starting-stats.js';
import {recoverFightStamina} from '../fight-stamina.js';
import {calculateFighterStats, getFightParticipants, getMoveDefinition} from './fight-judge-utils.js';

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
    if(!participantFight) {
      return null;
    }
    recoverFightStamina(participantFight.fight);
    applyIdleAttacks(participantFight.fight);
    return getCalculatedFight(participantFight.fight, participantFight.role);
  }

  move(playerID, moveID, moveNum) {
    const participantFight = getParticipantFight(this.#fightsByPlayerID, playerID);
    recoverFightStamina(participantFight.fight);
    const activeParticipant = participantFight.fight.details[participantFight.role];
    if(activeParticipant.moveList.includes(moveNum)) {
      return false;
    }
    const move = getFightMoveOrThrow(participantFight, moveID),
      moveDefinition = getMoveDefinition(moveID);
    return executeFightAction(participantFight, activeParticipant, move, moveDefinition, moveNum);
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
  const {staminaRecoveredAt, staminaRecoveryRemainder, ...visibleParticipant} = participant;
  return {...visibleParticipant, stats: {...participant.stats, ...calculateFighterStats(participant.stats)}};
}

export function attachFightJudge(app) {
  const judge = new FightJudge();
  const models = {fighters: fightersModel(app.db), fights: fightsModel(app.db)};
  app.decorate('fightJudge', judge);
  app.addHook('onReady', () => judge.load(models));
}

const getFightMove = (participantFight, moveID) => participantFight.fight.details[participantFight.role].moves.find(({id}) => id === moveID) || null;

function fail(message) {
  throw new Error(message);
}

const getFightMoveOrThrow = (participantFight, moveID) => getFightMove(participantFight, moveID) ?? fail(`Unknown move:${moveID}`);

function getParticipantFight(fightsByPlayerID, playerID) {
  return fightsByPlayerID.get(playerID) ?? fail(`No fight for player:${playerID}`);
}

import fightersModel from '../data/models/fighters.js';
import fightsModel from '../data/models/fights/index.js';
import {
  captureStartingStats,
  getCalculatedFight,
  getFightMoveOrThrow,
  getOpponentParticipant,
  getParticipantFight,
  removeFightByID,
} from './fight-judge-state.js';
import {recoverFightStamina} from './fight-stamina.js';
import {executeFightAction, applyIdleAttacks} from './fight-judge-actions.js';
import {getFightParticipants, getMoveDefinition} from './fight-judge-utils.js';

export class FightJudge {
  #fightsByPlayerID = new Map();
  #fights = null;
  #fightCleanupTimers = new Map();

  async load({fighters, fights}) {
    for(const timeoutID of this.#fightCleanupTimers.values()) {
      clearTimeout(timeoutID);
    }
    this.#fightCleanupTimers.clear();
    this.#fightsByPlayerID.clear();
    this.#fights = fights;
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
    if(participantFight.fight.victory != null || activeParticipant.moveList.includes(moveNum)) {
      return false;
    }
    const move = getFightMoveOrThrow(participantFight, moveID),
      moveDefinition = getMoveDefinition(moveID);
    const wasActionExecuted = executeFightAction(participantFight, activeParticipant, move, moveDefinition, moveNum);
    if(!wasActionExecuted) {
      return false;
    }
    this.#resolveFight(participantFight);
    return true;
  }

  #resolveFight(participantFight) {
    const opponentParticipant = getOpponentParticipant(participantFight);
    if(!opponentParticipant || opponentParticipant.stats.health >= 0n || participantFight.fight.victory != null) {
      return;
    }
    const didAttackerWin = participantFight.role === 'attacker';
    participantFight.fight.victory = didAttackerWin;
    if(this.#fights) {
      this.#fights.update(participantFight.fight.id, {victory: didAttackerWin}).catch(console.warn);
    }
    this.#scheduleFightCleanup(participantFight.fight.id);
  }

  #scheduleFightCleanup(fightID) {
    if(this.#fightCleanupTimers.has(fightID)) {
      return;
    }
    const timeoutID = setTimeout(() => {
      this.#fightCleanupTimers.delete(fightID);
      this.#removeFight(fightID);
    }, 60_000);
    this.#fightCleanupTimers.set(fightID, timeoutID);
  }

  #removeFight(fightID) {
    removeFightByID(this.#fightsByPlayerID, fightID);
  }
}

export function attachFightJudge(app) {
  const judge = new FightJudge();
  const models = {fighters: fightersModel(app.db), fights: fightsModel(app.db)};
  app.decorate('fightJudge', judge);
  app.addHook('onReady', () => judge.load(models));
}

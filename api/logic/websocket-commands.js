import {authenticate} from './auth.js';
import {createCommandError} from './command-errors.js';
import {registerFighterAction, unregisterFighterAction} from './fighter-actions.js';
import {generateGoldBotStats} from './fight-bot.js';
import {getPlayerState, sendPlayerState} from './player-state.js';
import {applyTraining} from './training.js';
import {FIGHTER_STAT_KEYS} from 'shared/stats.js';

export async function processMessageCommand(models, message, socket) {
  switch(message.cmd) {
    case 'auth':
      return auth(models, message, socket);
    case 'fight':
      return fight(models, socket);
    case 'idle':
      return idle(models, message, socket);
    case 'stop':
      return stop(models, message, socket);
    default:
      socket.send(JSON.stringify({cmd: 'error', error: 'invalid-cmd'}));
  }
}

async function auth(models, message, socket) {
  const player = await authenticate(models, message);
  socket.player = player;
  socket.send(JSON.stringify({cmd: 'auth', display_name: player.display_name, player_id: player.id, token: player.token}));
  await sendCurrentPlayerState(models, socket);
}

async function fight(models, socket) {
  if(!socket.player) {
    throw createCommandError('invalid-fight-message');
  }
  const fighter = await models.fighters.findCurrentByPlayerID(socket.player.id);
  if(!fighter) {
    throw createCommandError('invalid-fight-message');
  }
  const reason = 'gold';
  const fight = await models.fights.create({
    attacker: fighter.id,
    defender: null,
    details: createFightDetails(fighter, reason),
    reason,
  });
  socket.send(JSON.stringify({cmd: 'ok', metadata: {fight, responded_cmd: 'fight'}}));
}

function createFightDetails(fighter, reason) {
  return {
    attacker: {starting_stats: captureStartingStats(fighter)},
    ...(reason === 'gold' ? {defender: {starting_stats: generateGoldBotStats(fighter.stats)}} : {}),
  };
}

function captureStartingStats(fighter) {
  return Object.fromEntries(
    FIGHTER_STAT_KEYS.map((stat) => [stat, (fighter[stat] ?? fighter.stats?.[stat] ?? 0).toString()]),
  );
}

async function idle(models, message, socket) {
  if(!socket.player) {
    throw createCommandError('invalid-idle-message');
  }
  await applyCurrentTraining(models, socket.player.id);
  const fighterAction = await registerFighterAction(models, message, socket.player.id);
  socket.send(JSON.stringify({cmd: 'ok', metadata: {fighterAction, responded_cmd: 'idle'}}));
  await sendCurrentPlayerState(models, socket);
}

async function stop(models, message, socket) {
  if(!socket.player) {
    throw createCommandError('invalid-stop-message');
  }
  const fighterAction = await unregisterFighterAction(models, message, socket.player.id);
  socket.send(JSON.stringify({cmd: 'ok', metadata: {fighterAction, responded_cmd: 'stop'}}));
  await sendCurrentPlayerState(models, socket);
}

async function applyCurrentTraining(models, playerID) {
  if(!canSendPlayerState(models)) {
    return;
  }
  const fighter = await models.fighters.findCurrentByPlayerID(playerID);
  if(!fighter) {
    return;
  }
  await applyTraining(models, fighter);
}

async function sendCurrentPlayerState(models, socket) {
  if(!canSendPlayerState(models)) {
    return;
  }
  const state = await getPlayerState(models, socket.player.id);
  if(!state) {
    return;
  }
  sendPlayerState(state.actions, state.fighter, socket, state.fight);
}

function canSendPlayerState({fighterActions, fighters}) {
  return Boolean(fighterActions?.listByFighterID && fighters?.findCurrentByPlayerID);
}

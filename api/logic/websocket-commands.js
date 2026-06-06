import {authenticate} from './auth.js';
import {createCommandError} from './command-errors.js';
import {registerFighterAction, unregisterFighterAction} from './fighter-actions.js';
import {createFight} from './fights/index.js';
import {getPlayerState, sendPlayerState} from './player-state.js';
import {applyTraining} from './training.js';
const MAX_MOVE_CLICKS = 200;
const onCommand = {
  auth,
  fight,
  idle,
  move,
  stop,
};

export async function processMessageCommand(models, message, socket) {
  const runCommand = onCommand[message.cmd];
  if(!runCommand) {
    socket.send(JSON.stringify({cmd: 'error', error: 'invalid-cmd'}));
    return;
  }
  await runCommand(models, message, socket);
}

async function auth(models, message, socket) {
  const player = await authenticate(models, message);
  socket.player = player;
  socket.send(JSON.stringify({cmd: 'auth', display_name: player.display_name, player_id: player.id, token: player.token}));
  await sendCurrentPlayerState(models, socket);
}

async function fight(models, {reason, rank}, socket) {
  const fight = await createFight(models, socket.player?.id, reason, rank);
  socket.send(JSON.stringify({cmd: 'ok', metadata: {fight, responded_cmd: 'fight'}}));
  await sendCurrentPlayerState(models, socket);
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

async function move(models, message, socket) {
  if(!socket.player) {
    throw createCommandError('invalid-move-message');
  }
  const {clicks, moveID} = normalizeMoveMessage(message);
  try {
    for(let clickCount = 0; clickCount < clicks; clickCount += 1) {
      models.fightJudge.move(socket.player.id, moveID);
    }
  }
  catch(e) {
    console.warn(e);
    throw createCommandError('invalid-move-message');
  }
  await sendCurrentPlayerState(models, socket);
}

async function stop(models, message, socket) {
  if(!socket.player) {
    throw createCommandError('invalid-stop-message');
  }
  await applyCurrentTraining(models, socket.player.id);
  const fighterAction = await unregisterFighterAction(models, message, socket.player.id);
  socket.send(JSON.stringify({cmd: 'ok', metadata: {fighterAction, responded_cmd: 'stop'}}));
  await sendCurrentPlayerState(models, socket);
}

function normalizeMoveMessage(message) {
  const moveID = Number(message?.move_id);
  if(!Number.isInteger(moveID)) {
    throw createCommandError('invalid-move-message');
  }
  const clicks = message?.clicks === undefined ? 1 : Number(message.clicks);
  if(!Number.isInteger(clicks) || clicks < 1 || clicks > MAX_MOVE_CLICKS) {
    throw createCommandError('invalid-move-message');
  }
  return {clicks, moveID};
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

import {authenticate} from './auth.js';
import {createCommandError} from './command-errors.js';
import {registerFighterAction, unregisterFighterAction} from './fighter-actions.js';
import {getPlayerState, sendPlayerState} from './player-state.js';

export async function processMessageCommand(models, message, socket) {
  switch(message.cmd) {
    case 'auth':
      return handleAuth(models, message, socket);
    case 'idle':
      return handleIdle(models, message, socket);
    case 'stop':
      return handleStop(models, message, socket);
    default:
      socket.send(JSON.stringify({cmd: 'error', error: 'invalid-cmd'}));
  }
}

function canSendPlayerState({fighterActions, fighters}) {
  return Boolean(fighterActions?.listByFighterID && fighters?.findCurrentByPlayerID);
}

async function handleAuth(models, message, socket) {
  const player = await authenticate(models, message);
  socket.player = player;
  socket.send(JSON.stringify({cmd: 'auth', display_name: player.display_name, player_id: player.id, token: player.token}));
  if(canSendPlayerState(models)) {
    const state = await getPlayerState(models, player.id);
    if(state) {
      sendPlayerState(state.actions, state.fighter, socket);
    }
  }
}

async function handleIdle(models, message, socket) {
  if(!socket.player) {
    throw createCommandError('invalid-idle-message');
  }
  const fighterAction = await registerFighterAction(models, message, socket.player.id);
  socket.send(JSON.stringify({cmd: 'ok', metadata: {fighterAction, responded_cmd: 'idle'}}));
}

async function handleStop(models, message, socket) {
  if(!socket.player) {
    throw createCommandError('invalid-stop-message');
  }
  const fighterAction = await unregisterFighterAction(models, message, socket.player.id);
  socket.send(JSON.stringify({cmd: 'ok', metadata: {fighterAction, responded_cmd: 'stop'}}));
}

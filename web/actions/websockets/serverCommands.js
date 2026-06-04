import useFighterActionsStore from '@/data/fighterActions.js';
import useFighterStore from '@/data/fighter.js';
import useFightStore from '@/data/fight.js';
import usePlayerStore from '@/data/player.js';
import {
  onAuth as onAuthMessage,
  onAuthInvalidToken as onAuthInvalidTokenMessage,
} from '@/actions/websockets/auth.js';
import {parseSocketMessage} from '@/actions/websockets/state/websocketState.js';

const onSocketCommand = {
  'auth': onAuth,
  'auth-invalid-token': onAuthInvalidToken,
  'ok': () => {},
  'player_state': onPlayerState,
};

export function generateOnSocketMessageFn(socket, scheduleReconnectTimeout) {
  return function onSocketMessage(event) {
    scheduleReconnectTimeout();
    const message = parseSocketMessage(event);
    if(!message) {
      return;
    }
    const onCommand = onSocketCommand[message.cmd];
    if(!onCommand) {
      console.warn('Unknown websocket cmd:', message.cmd);
      return;
    }
    onCommand(message, socket);
  };
}

function onAuth(message, socket) {
  onAuthMessage({message, socket});
}

function onAuthInvalidToken() {
  onAuthInvalidTokenMessage();
}

function onPlayerState(message) {
  if(!message.fighter) {
    return;
  }
  useFighterActionsStore.getState().setActions(Array.isArray(message.actions) ? message.actions : []);
  useFightStore.getState().syncServerState(message.fight || null);
  useFighterStore.getState().overwrite(message.fighter);
  usePlayerStore.getState().setPlayerID(message.fighter.player ?? null);
  usePlayerStore.getState().selectFighter(`${message.fighter.race}`);
}

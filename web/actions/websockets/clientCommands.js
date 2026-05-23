import {
  onAuth as onAuthMessage,
  onAuthInvalidToken as onAuthInvalidTokenMessage,
} from '@/actions/websockets/auth.js';
import useFighterActionsStore from '@/data/fighterActions.js';
import useFighterStore from '@/data/fighter.js';
import usePlayerStore from '@/data/player.js';

export const onSocketCommand = {
  'auth': onAuth,
  'auth-invalid-token': onAuthInvalidToken,
  'ok': () => {},
  'player_state': onPlayerState,
};

function onAuth(message, socket) {
  onAuthMessage({message, socket});
}

function onAuthInvalidToken(message, socket) {
  onAuthInvalidTokenMessage(socket);
}

function onPlayerState(message) {
  if(!message.fighter) {
    return;
  }
  useFighterActionsStore.getState().setActions(Array.isArray(message.actions) ? message.actions : []);
  useFighterStore.getState().overwrite(message.fighter);
  usePlayerStore.getState().setPlayerID(message.fighter.player_id ?? null);
  usePlayerStore.getState().selectFighter(`${message.fighter.race}`);
}

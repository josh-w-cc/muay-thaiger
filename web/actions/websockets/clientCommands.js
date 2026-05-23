import useFighterActionsStore from '@/data/fighterActions.js';
import {
  respondToAuth,
  routeToHubIfAuthorized,
} from '@/actions/websockets/auth.js';
import {isSocketReady} from '@/actions/websockets/websocketState.js';

export function createFighterActionCmd(socket, actionID) {
  if(!Number.isInteger(actionID) || !isSocketReady(socket)) {
    return;
  }
  useFighterActionsStore.getState().addAction({action_id: actionID});
  socket.send(JSON.stringify({action_id: actionID, cmd: 'idle'}));
}

export function selectFighterCmd(socket) {
  respondToAuth(socket);
  routeToHubIfAuthorized();
}

import {
  respondToAuth,
  routeToHubIfAuthorized,
} from '@/actions/websockets/auth.js';
import {isSocketReady} from '@/actions/websockets/websocketState.js';

export function createFighterActionCmd(socket, actionID) {
  if(!isSocketReady(socket)) {
    return;
  }
  socket.send(JSON.stringify({action_id: actionID, cmd: 'idle'}));
}

export function selectFighterCmd(socket) {
  respondToAuth(socket);
  routeToHubIfAuthorized();
}

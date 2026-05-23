import {
  respondToAuth,
  routeToHubIfAuthorized,
} from '@/actions/websockets/auth.js';
import {isSocketReady} from '@/actions/websockets/websocketState.js';

export function createFighterActionCmd(socket, actionID) {
  sendFighterActionCmd(socket, {action_id: actionID, cmd: 'idle'});
}

export function removeFighterActionCmd(socket, actionID) {
  sendFighterActionCmd(socket, {action_id: actionID, cmd: 'stop'});
}

export function selectFighterCmd(socket) {
  respondToAuth(socket);
  routeToHubIfAuthorized();
}

function sendFighterActionCmd(socket, command) {
  if(!isSocketReady(socket)) {
    return;
  }
  socket.send(JSON.stringify(command));
}

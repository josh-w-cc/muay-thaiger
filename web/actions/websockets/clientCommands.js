import {
  respondToAuth,
  routeToHubIfAuthorized,
} from '@/actions/websockets/auth.js';
import {isSocketReady} from '@/actions/websockets/websocketState.js';

export function createFighterActionCmd(socket, actionID) {
  sendCommand(socket, {action_id: actionID, cmd: 'idle'});
}

export function removeFighterActionCmd(socket, actionID) {
  sendCommand(socket, {action_id: actionID, cmd: 'stop'});
}

export function selectFighterCmd(socket) {
  respondToAuth(socket);
  routeToHubIfAuthorized();
}

function sendCommand(socket, command) {
  if(!isSocketReady(socket)) {
    return;
  }
  socket.send(JSON.stringify(command));
}

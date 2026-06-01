import {
  respondToAuth,
  routeToHubIfAuthorized,
} from '@/actions/websockets/auth.js';
import {connectSocketOnAppLoad, sendCommand} from '@/actions/websockets/index.js';

export function createFighterActionCmd(actionID) {
  sendCommand({action_id: actionID, cmd: 'idle'});
}

export function createFightCmd(reason) {
  sendCommand({cmd: 'fight', reason});
}

export function removeFighterActionCmd(actionID) {
  sendCommand({action_id: actionID, cmd: 'stop'});
}

export function selectFighterCmd() {
  respondToAuth(connectSocketOnAppLoad());
  routeToHubIfAuthorized();
}

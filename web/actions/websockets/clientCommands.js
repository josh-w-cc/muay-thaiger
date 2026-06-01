import {
  respondToAuth,
  routeToHubIfAuthorized,
} from '@/actions/websockets/auth.js';
import {connectSocketOnAppLoad, sendCommand} from '@/actions/websockets/index.js';

export function createFighterActionCmd(actionID) {
  sendCommand({action_id: actionID, cmd: 'idle'});
}

export function createFightCmd(reason, rank = null) {
  sendCommand({cmd: 'fight', reason, rank});
}

export function removeFighterActionCmd(actionID) {
  sendCommand({action_id: actionID, cmd: 'stop'});
}

export function selectFighterCmd() {
  respondToAuth(connectSocketOnAppLoad());
  routeToHubIfAuthorized();
}

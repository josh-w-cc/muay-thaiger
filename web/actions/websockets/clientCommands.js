import {
  respondToAuth,
  routeToHubIfAuthorized,
} from '@/actions/websockets/auth.js';
import {connectSocketOnAppLoad, sendCommand} from '@/actions/websockets/index.js';
import {isFightReason, normalizeFightReason} from 'shared/fights.js';

export function createFighterActionCmd(actionID) {
  sendCommand({action_id: actionID, cmd: 'idle'});
}

export function createFightCmd(reason, rank = '') {
  const normalizedReason = normalizeFightReason(reason);
  if(!isFightReason(normalizedReason)) {
    return;
  }
  sendCommand({cmd: 'fight', reason: normalizedReason, rank});
}

export function removeFighterActionCmd(actionID) {
  sendCommand({action_id: actionID, cmd: 'stop'});
}

export function selectFighterCmd() {
  respondToAuth(connectSocketOnAppLoad());
  routeToHubIfAuthorized();
}

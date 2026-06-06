import usePlayerStore from '@/data/player.js';
import {canRespondToAuth, getAuthResponse} from '@/actions/websockets/state/websocketState.js';
import {clearPlayerToken, getPlayerToken, setPlayerToken} from '@/actions/websockets/state/token.js';
import {navigateWithWebsocketRouter} from '@/actions/websockets/state/router.js';

let hasReceivedAuthRequest = false;
let hasRespondedToAuth = false;

export function onAuth({message, socket}) {
  if(message.display_name) {
    usePlayerStore.getState().setPlayerName(message.display_name);
  }
  if(Number.isInteger(message.player_id)) {
    usePlayerStore.getState().setPlayerID(message.player_id);
  }
  if(message.token) {
    setPlayerToken(message.token);
    routeToHubIfAuthorized();
  }
  hasReceivedAuthRequest = true;
  respondToAuth(socket);
}

export function onAuthInvalidToken() {
  clearPlayerToken();
  window.location.href = '/';
}

export function resetAuthState() {
  hasReceivedAuthRequest = false;
  hasRespondedToAuth = false;
}

export function respondToAuth(socket) {
  const {selectedRace} = usePlayerStore.getState();
  const token = getPlayerToken();
  if(!canRespondToAuth({hasReceivedAuthRequest, hasRespondedToAuth, selectedRace, socket, token})) {
    return;
  }
  hasRespondedToAuth = true;
  socket.send(JSON.stringify(getAuthResponse({selectedRace, token})));
}

export function routeToHubIfAuthorized() {
  const {selectedRace} = usePlayerStore.getState();
  const token = getPlayerToken();
  if(!selectedRace || !token) {
    return;
  }
  navigateWithWebsocketRouter('/hub');
}

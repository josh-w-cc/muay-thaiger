import usePlayerStore from '@/data/player.js';
import router from '@/router.js';
import {canRespondToAuth, getAuthResponse} from '@/actions/websockets/state/websocketState.js';
import {clearPlayerToken, getPlayerToken, setPlayerToken} from '@/actions/websockets/state/token.js';

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
  console.debug('WebSocket send cmd:', 'auth');
  socket.send(JSON.stringify(getAuthResponse({selectedRace, token})));
}

export function routeToHubIfAuthorized() {
  const {selectedRace} = usePlayerStore.getState();
  const token = getPlayerToken();
  if(!selectedRace || !token) {
    return;
  }
  router.navigate('/hub');
}

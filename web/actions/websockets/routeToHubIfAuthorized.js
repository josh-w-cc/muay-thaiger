import {getPlayerToken} from '@/actions/websockets/token.js';
import usePlayerStore from '@/data/player.js';
import router from '@/router.js';


export default function routeToHubIfAuthorized() {
  const {selectedRace} = usePlayerStore.getState();
  const token = getPlayerToken();
  if(!selectedRace || !token) {
    return;
  }
  router.navigate('/hub');
}

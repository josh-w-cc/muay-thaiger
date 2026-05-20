import useFighterStore from '@/data/fighter.js';
import usePlayerStore from '@/data/player.js';
import {selectFighterCmd} from '@/data/websocket.js';
import {getConnectedSocket} from '@/pages/Game/useConnectSocket.js';


export default function selectFighter(id) {
  useFighterStore.getState().select(id);
  selectFighterCmd({
    get: usePlayerStore.getState,
    race: id,
    set: usePlayerStore.setState,
    socket: getConnectedSocket(),
  });
}

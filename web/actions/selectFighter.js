import useFighterStore from '@/data/fighter.js';
import usePlayerStore from '@/data/player.js';
import {selectFighterCmd} from '@/data/websocket.js';
import {getConnectedSocket} from '@/pages/Game/useConnectSocket.js';


export default function selectFighter(id) {
  useFighterStore.getState().select(id);
  usePlayerStore.getState().selectFighter(id);
  selectFighterCmd({
    get: usePlayerStore.getState,
    set: usePlayerStore.setState,
    socket: getConnectedSocket(),
  });
}

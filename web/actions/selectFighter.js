import useFighterStore from '@/data/fighter.js';
import usePlayerStore from '@/data/player.js';
import {connectSocketOnAppLoad} from '@/pages/Game/useConnectSocket.js';


export default function selectFighter(id) {
  useFighterStore.getState().select(id);
  usePlayerStore.getState().onFighterSelect({race: id, socket: connectSocketOnAppLoad()});
}

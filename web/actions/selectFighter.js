import useFighterStore from '@/data/fighter.js';
import usePlayerStore from '@/data/player.js';
import {selectFighterCmd} from '@/data/websocket.js';


export default function selectFighter(id) {
  useFighterStore.getState().select(id);
  usePlayerStore.getState().selectFighter(id);
  selectFighterCmd();
}

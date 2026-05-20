import useFighterStore from '@/data/fighter.js';
import usePlayerStore from '@/data/player.js';
import {selectFighterCmd} from '@/actions/websockets/index.js';


export default function selectFighter(id) {
  useFighterStore.getState().select(id);
  usePlayerStore.getState().selectFighter(id);
  selectFighterCmd();
}

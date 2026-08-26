import useFighterStore from '@/data/fighter/index.js';
import usePlayerStore from '@/data/player.js';
import {selectFighterCmd} from '@/actions/websockets/clientCommands.js';


export default function selectFighter(id) {
  useFighterStore.getState().select(id);
  usePlayerStore.getState().selectFighter(id);
  selectFighterCmd();
}

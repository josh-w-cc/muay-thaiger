import useFighterStore from '@/orig/src/Fighter.js';


export default function selectFighter(id) {
  useFighterStore.getState().select(id);
}

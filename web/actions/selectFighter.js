import useFighterStore from '@/data/fighter.js';


export default function selectFighter(id) {
  useFighterStore.getState().select(id);
}

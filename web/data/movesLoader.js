import useMovesStore from '@/data/moves.js';
import {fetchJSON} from '@/utils/fetchAPI.js';


export default async function loadMoves() {
  const {setMoves} = useMovesStore.getState();

  try {
    const moves = await fetchJSON('moves');
    setMoves(moves);
    return moves;
  }
  catch(error) {
    console.error('Failed to load moves', error);
    setMoves([]);
    return [];
  }
}

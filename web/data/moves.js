import {create} from 'zustand';

const useMovesStore = create((set) => ({
  ...getInitialState(),
  setMoves: (moves) => set({moves: normalizeMoves(moves)}),
}));
export default useMovesStore;


export function resetMovesStore() {
  useMovesStore.setState(getInitialState());
}

function getInitialState() {
  return {
    moves: [],
  };
}

function normalizeMoves(moves) {
  if(!Array.isArray(moves)) {
    return [];
  }
  return moves;
}

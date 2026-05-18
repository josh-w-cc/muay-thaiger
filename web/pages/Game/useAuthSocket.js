import usePlayerStore from '@/data/playerStore.js';
import useConnectSocket from './useConnectSocket.js';


export {PLAYER_TOKEN_STORAGE_KEY} from '@/data/playerStore.js';

export default function useAuthSocket(setScreen) {
  const onFighterSelect = usePlayerStore((state) => state.onFighterSelect);
  const onSocketMessage = usePlayerStore((state) => state.onSocketMessage);
  const socketRef = useConnectSocket(({message, socket}) => onSocketMessage({message, setScreen, socket}));
  return (race) => {
    onFighterSelect({race, setScreen, socket: socketRef.current});
  };
}

import usePlayerStore from '@/data/player.js';
import useConnectSocket from './useConnectSocket.js';


export {PLAYER_TOKEN_STORAGE_KEY} from '@/data/player.js';

export default function useAuthSocket(setScreen) {
  const onFighterSelect = usePlayerStore((state) => state.onFighterSelect);
  const onSocketMessage = usePlayerStore((state) => state.onSocketMessage);
  const socketRef = useConnectSocket(({message, socket}) => onSocketMessage({message, setScreen, socket}));
  return (race) => {
    onFighterSelect({race, setScreen, socket: socketRef.current});
  };
}

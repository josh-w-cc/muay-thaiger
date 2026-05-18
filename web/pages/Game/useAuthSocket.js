import usePlayerStore from '@/data/player.js';
import useConnectSocket from './useConnectSocket.js';


export default function useAuthSocket() {
  const onFighterSelect = usePlayerStore((state) => state.onFighterSelect);
  const onSocketMessage = usePlayerStore((state) => state.onSocketMessage);
  const socketRef = useConnectSocket(({message, socket}) => onSocketMessage({message, socket}));
  return (race) => {
    onFighterSelect({race, socket: socketRef.current});
  };
}

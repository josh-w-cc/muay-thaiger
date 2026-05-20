import usePlayerStore from '@/data/player.js';
import useConnectSocket from './useConnectSocket.js';


export default function useAuthSocket() {
  const onSocketMessage = usePlayerStore((state) => state.onSocketMessage);
  useConnectSocket(({message, socket}) => onSocketMessage({message, socket}));
}

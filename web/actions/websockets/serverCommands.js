import {onSocketCommand} from '@/actions/websockets/clientCommands.js';
import {parseSocketMessage} from '@/actions/websockets/websocketState.js';

export function generateOnSocketMessageFn(socket, scheduleReconnectTimeout) {
  return function onSocketMessage(event) {
    scheduleReconnectTimeout();
    const message = parseSocketMessage(event);
    if(!message) {
      return;
    }
    const onCommand = onSocketCommand[message.cmd];
    if(!onCommand) {
      console.warn('Unknown websocket cmd:', message.cmd);
      return;
    }
    onCommand(message, socket);
  };
}

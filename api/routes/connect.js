import {randomUUID} from 'node:crypto';


export default async function connectRoutes(app) {
  app.get('/connect', {websocket: true}, onConnect);
}

function onConnect(socket) {
  socket.on('message', (raw) => onMessage(raw, socket));
  setImmediate(() => {
    if(socket.readyState !== socket.OPEN) {
      return;
    }
    socket.send(JSON.stringify({type: 'auth'}));
  });
}

function onMessage(raw, socket) {
  let message;
  try {
    message = JSON.parse(raw);
  }
  catch{
    return;
  }
  if(message.type !== 'new') {
    return;
  }
  if(socket.readyState !== socket.OPEN) {
    return;
  }
  socket.send(JSON.stringify({
    token: randomUUID(),
    type: 'token',
  }));
}

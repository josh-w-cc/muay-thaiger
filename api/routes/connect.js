export default async function connectRoutes(app) {
  app.get('/connect', {websocket: true}, onConnect);
}

export function onConnect(socket) {
  socket.on('message', (raw) => onMessage(raw, socket));
  setImmediate(() => {
    if(socket.readyState !== socket.OPEN) {
      return;
    }
    socket.send(JSON.stringify({type: 'auth'}));
  });
}

export function onMessage(raw, socket) {
  let message;
  try {
    message = JSON.parse(raw);
  }
  catch{
    return;
  }
  if(message.type !== 'auth' || message.token !== 'new') {
    return;
  }
  if(socket.readyState !== socket.OPEN) {
    return;
  }
  socket.send(JSON.stringify({
    token: 'new',
    type: 'auth',
  }));
}

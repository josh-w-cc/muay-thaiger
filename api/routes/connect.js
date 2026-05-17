export default async function connectRoutes(app) {
  app.get('/connect', {websocket: true}, onConnect);
}

function onConnect(socket) {
  setImmediate(() => {
    if(socket.readyState !== socket.OPEN) {
      return;
    }
    socket.send(JSON.stringify({type: 'auth'}));
  });
}

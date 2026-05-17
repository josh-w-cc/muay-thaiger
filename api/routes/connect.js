export default async function connectRoutes(app) {
  app.get('/connect', {websocket: true}, (socket) => {
    setImmediate(() => {
      socket.send(JSON.stringify({type: 'auth'}));
    });
  });
}

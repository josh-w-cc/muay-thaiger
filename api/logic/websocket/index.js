import fp from 'fastify-plugin';

function ConnectionPool(app) {
  const {IdleSystem} = app;
  const connections = new Set();

  app.decorate('ConnectionPool', {connections});
}

export default fp(ConnectionPool, {
  dependencies: ['IdleSystem'],
});

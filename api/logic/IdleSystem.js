import fp from 'fastify-plugin';

function IdleSystemPlugin(app) {
  const {TrainingSystem} = app;

  function idle(fighter) {
    return TrainingSystem.train(fighter);
  }

  app.decorate('IdleSystem', {idle});
}

export default fp(IdleSystemPlugin, {
  name: 'IdleSystem',
  dependencies: ['FightSystem', 'TrainingSystem'],
});

import fp from 'fastify-plugin';

function IdleSystemPlugin(app) {
  function idle(fighter) {
    console.log('fighter');
    console.log(fighter);
    return fighter;
  }

  app.decorate('IdleSystem', {idle});
}

export default fp(IdleSystemPlugin, {
  dependencies: ['FightSystem', 'TrainingSystem'],
});

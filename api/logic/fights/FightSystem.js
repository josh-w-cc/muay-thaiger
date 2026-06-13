import fp from 'fastify-plugin';

function FightSystemPlugin(app) {
  function fight(fighter) {
    console.log('fighter');
    console.log(fighter);
    return fighter;
  }

  app.decorate('FightSystem', {fight});
}

export default fp(FightSystemPlugin, {
  name: 'FightSystem',
});

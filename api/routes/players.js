import playersModel from '#api/data/models/players.js';


/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function playersRoutes(app) {
  const players = playersModel(app.db);

  app.get('/players', async () => {
    const allPlayers = await players.list();
    return allPlayers.map(stripPrivatePlayerFields);
  });

  app.get('/players/:id', async (req, reply) => {
    const player = await players.find(Number(req.params.id));
    if(!player) {
      return reply.code(404).send({error: 'Not found'});
    }
    return stripPrivatePlayerFields(player);
  });
}

function stripPrivatePlayerFields(player) {
  const publicPlayer = {...player};
  delete publicPlayer.email;
  delete publicPlayer.password;
  return publicPlayer;
}

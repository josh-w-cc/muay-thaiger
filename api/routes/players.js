import playersModel from '../data/models/players.js';


/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function playersRoutes(app) {
  const players = playersModel(app.db);

  app.get('/players', async () => players.list());

  app.get('/players/:id', async (req, reply) => {
    const player = await players.find(Number(req.params.id));
    if(!player) {
      return reply.code(404).send({error: 'Not found'});
    }
    return player;
  });

  app.post('/players', async (req, reply) => {
    const player = await players.create(req.body);
    return reply.code(201).send(player);
  });
}

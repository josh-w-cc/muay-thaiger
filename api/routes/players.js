import playersModel from '../data/models/players.js';


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

  app.post('/players', async (req, reply) => {
    const player = await players.create(req.body);
    return reply.code(201).send(player);
  });
}

function stripPrivatePlayerFields(player) {
  const {email, password, ...publicPlayer} = player;
  return publicPlayer;
}

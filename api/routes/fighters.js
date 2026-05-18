import fightersModel from '../data/models/fighters.js';


/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function fightersRoutes(app) {
  const fighters = fightersModel(app.db);

  app.get('/fighters', async () => fighters.list());

  app.get('/fighters/:id', async (req, reply) => {
    const fighter = await fighters.find(Number(req.params.id));
    if(!fighter) {
      return reply.code(404).send({error: 'Not found'});
    }
    return fighter;
  });
}

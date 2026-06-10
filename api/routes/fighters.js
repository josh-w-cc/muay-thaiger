import fightersModel from '#api/data/models/fighters.js';
import {withFoundItem} from './with-found-item.js';


/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function fightersRoutes(app) {
  const fighters = fightersModel(app.db);

  app.get('/fighters', async () => fighters.list());

  app.get('/fighters/:id', async (req, reply) => {
    const fighter = await fighters.find(Number(req.params.id));
    return withFoundItem(fighter, reply);
  });
}

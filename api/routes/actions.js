import actionsModel from '#api/data/models/actions.js';
import {withFoundItem} from './with-found-item.js';


/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function actionsRoutes(app) {
  const actions = actionsModel(app.db);

  app.get('/actions', async () => actions.list());

  app.get('/actions/:id', async (req, reply) => {
    const action = await actions.find(Number(req.params.id));
    return withFoundItem(action, reply);
  });
}

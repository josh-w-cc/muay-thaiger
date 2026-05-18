import actionsModel from '../data/models/actions.js';
import {withFoundItem} from './shared/route-handlers.js';


/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function actionsRoutes(app) {
  const actions = actionsModel(app.db);

  app.get('/actions', async () => actions.list());

  app.get('/actions/:id', withFoundItem(actions, (action) => action));
}

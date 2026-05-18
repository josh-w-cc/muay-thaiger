import actionsModel from '../data/models/actions.js';


/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function actionsRoutes(app) {
  const actions = actionsModel(app.db);

  app.get('/actions', async () => actions.list());

  app.get('/actions/:id', async (req, reply) => {
    const action = await actions.find(Number(req.params.id));
    if(!action) {
      return reply.code(404).send({error: 'Not found'});
    }
    return action;
  });
}

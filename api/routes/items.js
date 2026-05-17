import itemsModel from '../data/models/items.js';


/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function itemsRoutes(app) {
  const items = itemsModel(app.db);

  app.get('/items', async () => items.list());

  app.get('/items/:id', async (req, reply) => {
    const item = await items.find(Number(req.params.id));
    if(!item) {
      return reply.code(404).send({error: 'Not found'});
    }
    return item;
  });

  app.post('/items', async (req, reply) => {
    const item = await items.create(req.body);
    return reply.code(201).send(item);
  });
}

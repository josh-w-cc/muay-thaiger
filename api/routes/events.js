import eventsModel from '../data/models/events.js';


/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function eventsRoutes(app) {
  const events = eventsModel(app.db);

  app.get('/events', async () => events.list());

  app.get('/events/:id', async (req, reply) => {
    const event = await events.find(Number(req.params.id));
    if(!event) {
      return reply.code(404).send({error: 'Not found'});
    }
    return event;
  });
}

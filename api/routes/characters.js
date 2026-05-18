import fightersModel from '../data/models/fighters.js';


/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function charactersRoutes(app) {
  const characters = fightersModel(app.db);

  app.get('/characters', async () => characters.list());

  app.get('/characters/:id', async (req, reply) => {
    const character = await characters.find(Number(req.params.id));
    if(!character) {
      return reply.code(404).send({error: 'Not found'});
    }
    return character;
  });
}

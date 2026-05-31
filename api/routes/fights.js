import fightsModel from '#api/data/models/fights.js';


/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function fightsRoutes(app) {
  const fights = fightsModel(app.db);

  app.get('/fights', async () => fights.list());
  app.get('/fights/:id', handleGetFight(fights));
  app.post('/fights', handlePostFight(fights));
  app.patch('/fights/:id', handlePatchFight(fights));
}

function handleGetFight(fights) {
  return async (req, reply) => {
    const fight = await fights.find(Number(req.params.id));
    if(!fight) {
      return reply.code(404).send({error: 'Not found'});
    }
    return fight;
  };
}

function handlePostFight(fights) {
  return async (req, reply) => {
    const {attacker, defender = null, reason, details = {}, rank = null} = req.body;
    const fight = await fights.create({attacker, defender, reason, details, rank});
    return reply.code(201).send(fight);
  };
}

function handlePatchFight(fights) {
  return async (req, reply) => {
    const id = Number(req.params.id);
    const existing = await fights.find(id);
    if(!existing) {
      return reply.code(404).send({error: 'Not found'});
    }
    return fights.update(id, req.body);
  };
}

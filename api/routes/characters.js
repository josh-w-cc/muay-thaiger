import fightersModel from '../data/models/fighters.js';
import {withFoundItem} from './shared/route-handlers.js';


/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function charactersRoutes(app) {
  const characters = fightersModel(app.db);

  app.get('/characters', async () => characters.list());

  app.get('/characters/:id', withFoundItem(characters, (character) => character));
}

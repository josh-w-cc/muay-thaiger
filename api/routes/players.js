import playersModel from '../data/models/players.js';
import {withFoundItem} from './shared/route-handlers.js';


/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function playersRoutes(app) {
  const players = playersModel(app.db);

  app.get('/players', async () => {
    const allPlayers = await players.list();
    return allPlayers.map(stripPrivatePlayerFields);
  });

  app.get('/players/:id', withFoundItem(players, stripPrivatePlayerFields));
}

function stripPrivatePlayerFields(player) {
  const publicPlayer = {...player};
  delete publicPlayer.email;
  delete publicPlayer.password;
  return publicPlayer;
}

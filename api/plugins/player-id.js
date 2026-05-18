import playersModel from '../data/models/players.js';


/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function playerIDMiddleware(app) {
  const players = playersModel(app.db);
  app.decorateRequest('playerId', null);
  app.addHook('onRequest', async (req) => {
    const token = getToken(req.headers.authorization);
    if(!token) {
      return;
    }
    const player = await players.findByToken(token);
    req.playerId = player?.id ?? null;
  });
}

function getToken(authorization) {
  if(typeof authorization !== 'string') {
    return null;
  }
  const [scheme, ...tokenParts] = authorization.split(' ');
  if(scheme !== 'Bearer' || tokenParts.length === 0) {
    return null;
  }
  return tokenParts.join(' ').trim() || null;
}

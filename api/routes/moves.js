import movesModel from '#api/data/models/moves.js';


export default async function movesRoutes(app) {
  const moves = movesModel(app.db);

  app.get('/moves', async () => moves.list());
}

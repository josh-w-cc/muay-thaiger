import racesModel from '../data/models/races.js';


export default async function raceRoutes(app) {
  const races = racesModel(app.db);

  app.get('/race', async () => races.list());
}

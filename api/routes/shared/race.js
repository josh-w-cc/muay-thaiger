import staticsModel from '../../data/models/statics.js';


export default async function raceRoutes(app) {
  const statics = staticsModel(app.db);

  app.get('/race', async () => statics.listRace());
}

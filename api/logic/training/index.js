import fp from 'fastify-plugin';

import train from './train.js';


function TrainingSystemPlugin(app) {
  app.decorate('TrainingSystem', {train});
}

export default fp(TrainingSystemPlugin, {
  name: 'TrainingSystem',
});

import {existsSync} from 'node:fs';
import {join} from 'node:path';

import fastifyStatic from '@fastify/static';
import fp from 'fastify-plugin';

import {API_PREFIX, WS_PREFIX} from '../../shared/constants.js';


async function serveSPA(app) {
  const distPath = join(import.meta.dirname, '../../web/dist');
  if(!existsSync(distPath)) {
    return;
  }
  await app.register(fastifyStatic, {prefix: '/', root: distPath});
  app.setNotFoundHandler((req, reply) => {
    if(req.method === 'GET' && !req.url.startsWith(`${API_PREFIX}/`) && !req.url.startsWith(`${WS_PREFIX}/`)) {
      return reply.sendFile('index.html');
    }
    reply.code(404).send({error: 'Not found'});
  });
}

export default fp(serveSPA);

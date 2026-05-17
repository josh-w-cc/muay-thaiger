import {existsSync} from 'node:fs';
import {join} from 'node:path';

import fastifyStatic from '@fastify/static';
import fp from 'fastify-plugin';


async function serveSPA(app) {
  const distPath = join(import.meta.dirname, '../../web/dist');
  if(!existsSync(distPath)) {
    return;
  }
  await app.register(fastifyStatic, {prefix: '/', root: distPath});
  app.setNotFoundHandler((req, reply) => {
    if(req.method === 'GET' && !req.url.startsWith('/api/')) {
      return reply.sendFile('index.html');
    }
    reply.code(404).send({error: 'Not found'});
  });
}

export default fp(serveSPA);

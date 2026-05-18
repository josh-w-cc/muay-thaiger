/**
 * @param {import('fastify').FastifyInstance} app
 */
export default async function healthRoutes(app) {
  app.get('/health', async () => {
    return {status: 'ok'};
  });
}

/**
 * @param {{find: (id: number) => Promise<object|undefined>}} model
 * @param {(item: object, req: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) => unknown} handler
 */
export function withFoundItem(model, handler) {
  return async (req, reply) => {
    const item = await model.find(Number(req.params.id));
    if(!item) {
      return reply.code(404).send({error: 'Not found'});
    }
    return handler(item, req, reply);
  };
}

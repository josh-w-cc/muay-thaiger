export function withFoundItem(model, handler = identity) {
  return async (req, reply) => {
    const item = await model.find(Number(req.params.id));
    if(!item) {
      return reply.code(404).send({error: 'Not found'});
    }
    return handler(item);
  };
}

function identity(value) {
  return value;
}

export function withFoundItem(item, reply, transform = identity) {
  if(!item) {
    return reply.code(404).send({error: 'Not found'});
  }

  return transform(item);
}

function identity(item) {
  return item;
}

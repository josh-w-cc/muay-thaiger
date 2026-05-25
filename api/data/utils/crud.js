export function generateCreateFn(db, table, transformInput = identity) {
  return (data) => db(table).insert(transformInput(data)).returning('*').then((rows) => rows[0]);
}

export function generateFindFn(db, table) {
  return (id) => db(table).where({id}).first();
}

export function generateListFn(db, table, orderBy, direction) {
  return direction
    ? () => db(table).orderBy(orderBy, direction)
    : () => db(table).orderBy(orderBy);
}

export function generateRemoveFn(db, table) {
  return (id) => db(table).where({id}).del();
}

export function generateSearchFn(db, table) {
  return (params) => db(table).where(params);
}

export function generateUpdateFn(db, table, transformInput = identity) {
  return (id, data) => db(table).where({id}).update(transformInput(data)).returning('*').then((rows) => rows[0]);
}

function identity(value) {
  return value;
}

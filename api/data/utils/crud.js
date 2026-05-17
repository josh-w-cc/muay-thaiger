export function generateCreateFn(db, table) {
  return (data) => db(table).insert(data).returning('*').then((rows) => rows[0]);
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

export function generateUpdateFn(db, table) {
  return (id, data) => db(table).where({id}).update(data).returning('*').then((rows) => rows[0]);
}

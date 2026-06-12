export function mockKnex(result) {
  const calls = [];
  const chain = buildChain(calls, result);
  const knex = (table) => (calls.push(['table', table]), chain);
  knex.raw = (...args) => (calls.push(['raw', ...args]), Promise.resolve(result?.rows ? result : {rowCount: 0, rows: []}));
  knex.transaction = (fn) => fn(knex);
  return {calls, knex};
}

export function mockKnexMulti(tableResults, rawResults = []) {
  const calls = [];
  let tableIndex = 0;
  let rawIndex = 0;
  const knex = (table) => (calls.push(['table', table]), buildChain(calls, tableResults[tableIndex++]));
  knex.raw = (...args) => (calls.push(['raw', ...args]), Promise.resolve(rawResults[rawIndex++] ?? {rowCount: 0, rows: []}));
  knex.transaction = (fn) => fn(knex);
  return {calls, knex};
}

function buildChain(calls, result) {
  const chain = {};
  const methods = [
    'clear', 'decrement', 'del', 'first', 'forUpdate', 'increment', 'insert', 'join', 'leftJoin', 'limit', 'orderBy',
    'orderByRaw', 'returning', 'select', 'update', 'where', 'whereBetween', 'whereILike', 'whereIn', 'whereNot',
    'whereNotNull', 'whereNull', 'whereRaw',
  ];
  for(const m of methods) {
    chain[m] = (...args) => (calls.push([m, ...args]), chain);
  }
  chain.then = (fn) => Promise.resolve(result).then(fn);
  return chain;
}

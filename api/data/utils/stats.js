import {parseBigIntStats} from 'shared/stats.js';

export function castStatsRows(rows) {
  if(Array.isArray(rows)) {
    return rows.map(castStats);
  }

  return castStats(rows);
}

export function castStats(row) {
  if(!row?.stats) {
    return row ?? null;
  }

  return {
    ...row,
    stats: parseBigIntStats(row.stats),
  };
}

export function serializeStats(stats) {
  return Object.fromEntries(
    Object.entries(stats).map(([key, value]) => [key, value.toString()]),
  );
}

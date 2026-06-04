import {parseBigIntStats} from 'shared/stats.js';

export function castFightRows(rows) {
  if(Array.isArray(rows)) {
    return rows.map(castFight);
  }

  return castFight(rows);
}

export function castFight(row) {
  if(!row?.details) {
    return row ?? null;
  }

  return {
    ...row,
    details: castFightDetails(row.details),
  };
}

function castFightDetails(details) {
  if(!details || typeof details !== 'object' || Array.isArray(details)) {
    return details;
  }

  const casted = {...details};
  applyParticipantCast(casted, details, 'attacker');
  applyParticipantCast(casted, details, 'defender');
  return casted;
}

function applyParticipantCast(casted, details, key) {
  if(key in details) {
    casted[key] = castFightParticipant(details[key]);
  }
}

function castFightParticipant(participant) {
  if(!participant?.stats) {
    return participant;
  }

  return {
    ...participant,
    stats: parseBigIntStats(participant.stats),
  };
}

export function normalizeFightRow(row) {
  const fight = {...row};
  delete fight.attacker_player;
  delete fight.defender_player;
  return fight;
}

export function removeFightByID(activeFightByPlayerID, fightID) {
  for(const [playerID, fight] of activeFightByPlayerID.entries()) {
    if(fight.id === fightID) {
      activeFightByPlayerID.delete(playerID);
    }
  }
}

export function upsertFightByPlayerID(activeFightByPlayerID, fight, playerIDs, replaceExisting) {
  for(const playerID of playerIDs) {
    if(!playerID) {
      continue;
    }
    const key = String(playerID);
    if(!replaceExisting && activeFightByPlayerID.has(key)) {
      continue;
    }
    activeFightByPlayerID.set(key, fight);
  }
}

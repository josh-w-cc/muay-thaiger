export async function loadFightStore({fighters, fights}) {
  const store = new Map();
  const activeFights = await fights.listActive();
  const fighterPlayers = await getFightPlayerIDs(activeFights, fighters);

  for(const fight of activeFights) {
    setStoredFight(store, fighterPlayers.get(fight.attacker), fight);
    setStoredFight(store, fighterPlayers.get(fight.defender), fight);
  }

  return store;
}

export function getStoredFight(store, playerID) {
  if(!store || !playerID) {
    return null;
  }

  return store.get(playerID) ?? null;
}

export function storeFight(store, playerID, fight) {
  if(!store || !playerID || !fight || store.has(playerID)) {
    return;
  }

  store.set(playerID, fight);
}

async function getFightPlayerIDs(fights, fighters) {
  const fighterIDs = [...new Set(
    fights.flatMap(({attacker, defender}) => [attacker, defender].filter(Boolean)),
  )];

  return new Map(await Promise.all(
    fighterIDs.map(async (fighterID) => [fighterID, await getPlayerID(fighters, fighterID)]),
  ));
}

async function getPlayerID(fighters, fighterID) {
  const fighter = await fighters.find(fighterID);
  return fighter?.player ?? null;
}

function setStoredFight(store, playerID, fight) {
  if(!playerID || store.has(playerID)) {
    return;
  }

  store.set(playerID, fight);
}

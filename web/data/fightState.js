export const FIGHT_STATES = {IN_PROGRESS: 1, LOST: 2, NOT_STARTED: 0, WON: 3};
const {IN_PROGRESS: FIGHT_IN_PROGRESS, LOST: FIGHT_LOST, NOT_STARTED: FIGHT_NOT_STARTED, WON: FIGHT_WON} = FIGHT_STATES;
const MIN_BET = 100n;
const RISK_PERCENTAGES = [
  {denominator: 1000n, numerator: 1n},
  {denominator: 10n, numerator: 1n},
  {denominator: 4n, numerator: 1n},
  {denominator: 2n, numerator: 1n},
  {denominator: 1n, numerator: 1n},
];


export function getInitialState() {
  return {bet: 0n, fighters: [], messages: [], state: FIGHT_NOT_STARTED};
}


export function generateAttackFn({get, set}) {
  return (who) => {
    const {fighters} = get();
    if(fighters.length < 2) {
      return '';
    }

    const nextFighters = fighters.map((fighter) => ({...fighter}));
    const result = attackFighter({fighters: nextFighters, state: get().state, who});
    set({fighters: nextFighters, state: result.state});
    return result.message;
  };
}


export function generateFinishFn({get, set}) {
  return () => {
    const {bet, fighters, state} = get();
    if(state !== FIGHT_WON && state !== FIGHT_LOST) {
      return;
    }
    fighters[0].stats[state === FIGHT_WON ? 'win' : 'spend'](bet);
    fighters[0].stats.train('skill', 1);
    set(getInitialState());
  };
}


export function generateForGoldFn({get, set}) {
  return (fighter, risk) => {
    const bet = getBetAmount({gold: fighter.gold, risk});
    const fightBet = Number(bet);
    const enemy = {
      apm: Math.max(4, Math.log(fightBet)) * (Math.random() + 0.5),
      attack: Math.sqrt(fightBet) * (Math.random() + 0.5),
      defense: Math.sqrt(fightBet) * (Math.random() + 0.5),
      health: fightBet * 10 * (Math.random() + 0.5),
      power: fightBet * (Math.random() + 0.5),
      stamina: fightBet * Math.sqrt(fightBet) * (Math.random() + 0.5),
    };
    set({bet});
    get().start(fighter, enemy);
  };
}


export function generateStartFn({get, set}) {
  return (left, right) => {
    set({
      fighters: [
        {currentAPM: 0, currentHealth: left.health, currentStamina: left.stamina, stats: left},
        {currentAPM: 0, currentHealth: right.health, currentStamina: right.stamina, stats: right},
      ],
      state: FIGHT_IN_PROGRESS,
    });
    left.idle('FIGHT', (delta) => get().tick(delta));
  };
}


export function generateTickFn({get, set}) {
  return (amount) => {
    const {fighters, messages} = get();
    if(fighters.length < 2) {
      return;
    }

    const nextFighters = fighters.map((fighter) => ({...fighter}));
    nextFighters[0].currentAPM += nextFighters[0].stats.apm / 60000 * amount;
    nextFighters[1].currentAPM += nextFighters[1].stats.apm / 60000 * amount;
    const nextMessages = [...messages];
    const nextState = runFightCycles({fighters: nextFighters, messages: nextMessages, state: get().state});
    set({fighters: nextFighters, messages: nextMessages, state: nextState});
    if(nextState !== FIGHT_IN_PROGRESS) {
      return true;
    }
  };
}


function runFightCycles({fighters, messages, state}) {
  while(fighters[0].currentAPM > 1 || fighters[1].currentAPM > 1) {
    [0, 1].filter((fighterIndex) => fighters[fighterIndex].currentAPM > 1).forEach((fighterIndex) => {
      const result = attackFighter({fighters, state, who: fighterIndex});
      state = result.state;
      messages.push(result.message);
      fighters[fighterIndex].currentAPM -= 1;
    });
  }
  return state;
}


function attackFighter({fighters, state, who}) {
  const [you, them] = who ? [fighters[1], fighters[0]] : [fighters[0], fighters[1]];
  if(you.stats.attack * Math.random() <= them.stats.defense * Math.random()) {
    return {message: who ? 'Je missed :D' : 'You missed :(', state};
  }
  return resolveHit({damage: you.stats.power * (Math.random() + 0.5), state, them, who});
}


function resolveHit({damage, state, them, who}) {
  them.currentHealth -= damage;
  if(them.currentHealth < 0) {
    return {message: who ? 'You lost!!!!' : 'You win!!!!', state: who ? FIGHT_LOST : FIGHT_WON};
  }
  return {message: who ? `He hit you for ${damage}. (What a jerk)` : `You hit 'im for ${damage}`, state};
}

function getBetAmount({gold, risk}) {
  const percentage = RISK_PERCENTAGES[risk];
  if(!percentage) {
    return MIN_BET;
  }

  const normalizedGold = normalizeGold(gold);
  const percentageBet = normalizedGold * percentage.numerator / percentage.denominator;
  return percentageBet > MIN_BET ? percentageBet : MIN_BET;
}

function normalizeGold(gold) {
  if(typeof gold === 'bigint') {
    return gold;
  }

  if(typeof gold !== 'number' || !Number.isFinite(gold)) {
    return 0n;
  }

  return BigInt(Math.max(0, Math.floor(gold)));
}

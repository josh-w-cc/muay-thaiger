import {create} from 'zustand';


export const FIGHT_NOT_STARTED = 0;
export const FIGHT_IN_PROGRESS = 1;
export const FIGHT_LOST = 2;
export const FIGHT_WON = 3;

const PLAYER_POSITION = 0;
const ENEMY_POSITION = 1;


// Fight rules
//
// Increase turn meter +apm (or onClick)
// if(turnMeter > ?)
//   randomly pick a move (e.g. spearhand)
//   turnMeter -= moveCost
//   if(moveAttack + fighterAttack + random > defense + random)
//      enemyHealth -= movePower + fighterPower + random
// Stamina decrease as the fight continues?

const useFightStore = create((set, get) => ({
  ...getInitialState(),
  attack(who) {
    const {fighters} = get();
    if(fighters.length < 2) {
      return '';
    }

    const nextFighters = fighters.map((fighter) => ({...fighter}));
    const result = attackFighter({attackerIndex: who, fighters: nextFighters, state: get().state});
    set({
      fighters: nextFighters,
      state: result.state,
    });
    return result.message;
  },
  finish() {
    const {bet, fighters, state} = get();
    if(state !== FIGHT_WON && state !== FIGHT_LOST) {
      return;
    }

    if(state === FIGHT_WON) {
      fighters[PLAYER_POSITION].stats.win(bet);
    }
    else {
      fighters[PLAYER_POSITION].stats.spend(bet);
    }

    fighters[PLAYER_POSITION].stats.train('skill', 1);
    set(getInitialState());
  },
  forGold(fighter, risk) {
    const riskPercentages = [0.001, 0.1, 0.25, 0.5, 1];
    const bet = Math.max(100, Math.floor(fighter.gold * riskPercentages[risk]));
    const enemy = {
      apm: Math.max(4, Math.log(bet)) * (Math.random() + 0.5),
      attack: Math.sqrt(bet) * (Math.random() + 0.5),
      defense: Math.sqrt(bet) * (Math.random() + 0.5),
      health: bet * 10 * (Math.random() + 0.5),
      power: bet * (Math.random() + 0.5),
      stamina: bet * Math.sqrt(bet) * (Math.random() + 0.5),
    };
    set({bet});
    get().start(fighter, enemy);
  },
  start(left, right) {
    set({
      fighters: [
        {stats: left, currentAPM: 0, currentStamina: left.stamina, currentHealth: left.health},
        {stats: right, currentAPM: 0, currentStamina: right.stamina, currentHealth: right.health},
      ],
      state: FIGHT_IN_PROGRESS,
    });
    left.idle('FIGHT', (delta) => get().tick(delta));
  },
  tick(amount) {
    const {fighters, messages} = get();
    if(fighters.length < 2) {
      return;
    }

    const nextFighters = fighters.map((fighter) => ({...fighter}));
    const nextMessages = [...messages];
    let nextState = get().state;
    const aPerTick = nextFighters[PLAYER_POSITION].stats.apm / 60000;
    const bPerTick = nextFighters[ENEMY_POSITION].stats.apm / 60000;
    nextFighters[PLAYER_POSITION].currentAPM += aPerTick * amount;
    nextFighters[ENEMY_POSITION].currentAPM += bPerTick * amount;
    while(nextFighters[PLAYER_POSITION].currentAPM > 1 || nextFighters[ENEMY_POSITION].currentAPM > 1) {
      if(nextFighters[PLAYER_POSITION].currentAPM > 1) {
        const result = attackFighter({attackerIndex: PLAYER_POSITION, fighters: nextFighters, state: nextState});
        nextState = result.state;
        nextMessages.push(result.message);
        nextFighters[PLAYER_POSITION].currentAPM -= 1;
      }
      if(nextFighters[ENEMY_POSITION].currentAPM > 1) {
        const result = attackFighter({attackerIndex: ENEMY_POSITION, fighters: nextFighters, state: nextState});
        nextState = result.state;
        nextMessages.push(result.message);
        nextFighters[ENEMY_POSITION].currentAPM -= 1;
      }
    }
    set({
      fighters: nextFighters,
      messages: nextMessages,
      state: nextState,
    });
    if(nextState !== FIGHT_IN_PROGRESS) {
      return true;
    }
  },
}));

export default useFightStore;


export function resetFightStore() {
  useFightStore.setState(getInitialState());
}


function attackFighter({attackerIndex, fighters, state}) {
  if(attackerIndex === PLAYER_POSITION) {
    const you = fighters[PLAYER_POSITION];
    const them = fighters[ENEMY_POSITION];
    if(you.stats.attack * Math.random() > them.stats.defense * Math.random()) {
      const damage = you.stats.power * (Math.random() + 0.5);
      them.currentHealth -= damage;
      if(them.currentHealth < 0) {
        return {message: 'You win!!!!', state: FIGHT_WON};
      }
      return {message: `You hit 'im for ${damage}`, state};
    }
    return {message: 'You missed :(', state};
  }

  const you = fighters[ENEMY_POSITION];
  const them = fighters[PLAYER_POSITION];
  if(you.stats.attack * Math.random() > them.stats.defense * Math.random()) {
    const damage = you.stats.power * (Math.random() + 0.5);
    them.currentHealth -= damage;
    if(them.currentHealth < 0) {
      return {message: 'You lost!!!!', state: FIGHT_LOST};
    }
    return {message: `He hit you for ${damage}. (What a jerk)`, state};
  }
  return {message: 'He missed :D', state};
}

function getInitialState() {
  return {
    bet: 0,
    fighters: [],
    messages: [],
    state: FIGHT_NOT_STARTED,
  };
}

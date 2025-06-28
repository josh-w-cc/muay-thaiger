import React from 'react';
import {makeAutoObservable} from 'mobx';


export const FIGHT_NOT_STARTED = 0;
export const FIGHT_IN_PROGRESS = 1;
export const FIGHT_LOST = 2;
export const FIGHT_WON = 3;


// Fight rules
//
// Increase turn meter +apm (or onClick)
// if(turnMeter > ?)
//   randomly pick a move (e.g. spearhand)
//   turnMeter -= moveCost
//   if(moveAttack + fighterAttack + random > defense + random)
//      enemyHealth -= movePower + fighterPower + random
// Stamina decrease as the fight continues?

class Fight {
  constructor() {
    this.fighters = [];
    this.state = FIGHT_NOT_STARTED;
    this.bet = 0;
    this.messages = [];

    makeAutoObservable(this, {}, {autoBind: true});
  }

  forGold(fighter, risk) {
    const riskPercentages = [.001, .1, .25, .5, 1];
    this.bet = Math.max(100, Math.floor(fighter.gold * riskPercentages[risk]));
    const amount = this.bet;
    const enemy = {
      apm: Math.max(4, Math.log(amount)) * (Math.random() + 0.5),
      attack: Math.sqrt(amount) * (Math.random() + 0.5),
      defense: Math.sqrt(amount) * (Math.random() + 0.5),
      health: amount * 10 * (Math.random() + 0.5),
      power: amount * (Math.random() + 0.5),
      stamina: amount * Math.sqrt(amount) * (Math.random() + 0.5),
    };
    this.start(fighter, enemy);
  }

  start(left, right) {
    this.fighters = [
      {stats:left, currentAPM: 0, currentStamina: left.stamina, currentHealth: left.health},
      {stats:right, currentAPM: 0, currentStamina: right.stamina, currentHealth: right.health},
    ];
    this.state = FIGHT_IN_PROGRESS;
    left.idle('FIGHT', (delta) => this.tick(delta));
  }

  attack(who) {
    if(!who) {
      const you = this.fighters[0];
      const them = this.fighters[1];
      if(you.stats.attack * Math.random() > them.stats.defense * Math.random()) {
        const damage = you.stats.power * (Math.random() + 0.5);
        them.currentHealth -= damage;
        if(them.currentHealth < 0) {
          this.state = FIGHT_WON;
          return 'You win!!!!';
        }
        return `You hit 'im for ${damage}`;
      }
      return 'You missed :(';
    }
    else {
      const you = this.fighters[1];
      const them = this.fighters[0];
      if(you.stats.attack * Math.random() > them.stats.defense * Math.random()) {
        const damage = you.stats.power * (Math.random() + 0.5);
        them.currentHealth -= damage;
        if(them.currentHealth < 0) {
          this.state = FIGHT_LOST;
          return 'You lost!!!!';
        }
        return `He hit you for ${damage}. (What a jerk)`;
      }
      return 'Je missed :D';
    }
  }

  finish() {
    if(this.state === FIGHT_WON || this.state === FIGHT_LOST) {
      if(this.state === FIGHT_WON) {
        this.fighters[0].stats.win(this.bet);
      }
      else {
        this.fighters[0].stats.lose(this.bet);
      }

      this.fighters[0].stats.train('skill', 1);
      this.bet = 0;
      this.state = FIGHT_NOT_STARTED;
      this.messages = [];
    }
  }

  tick(amount) {
    const aPerTick = this.fighters[0].stats.apm / 60000;
    const bPerTick = this.fighters[1].stats.apm / 60000;
    this.fighters[0].currentAPM += aPerTick * amount;
    this.fighters[1].currentAPM += bPerTick * amount;
    while(this.fighters[0].currentAPM > 1 || this.fighters[1].currentAPM > 1) {
      if(this.fighters[0].currentAPM > 1) {
        this.messages.push(this.attack(0));
        this.fighters[0].currentAPM -= 1;
      }
      if(this.fighters[1].currentAPM > 1) {
        this.messages.push(this.attack(1));
        this.fighters[1].currentAPM -= 1;
      }
    }
    if(this.state !== FIGHT_IN_PROGRESS) {
      return true;
    }
  }
}


export default React.createContext(new Fight());
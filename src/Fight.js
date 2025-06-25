import React from 'react';
import {makeAutoObservable} from 'mobx';

export const FIGHT_NOT_STARTED = 0;
export const FIGHT_STARTED = 1;
export const FIGHT_WON = 2;


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

    makeAutoObservable(this, {}, {autoBind: true});
  }

  forGold(fighter, risk) {
    const riskPercentages = [.001, .1, .25, .5, 1];
    const amount = this.bet = Math.max(100, Math.floor(fighter.gold * riskPercentages[risk]));
    const enemy = {
      apm: Math.log(Math.log(amount)) * (Math.random() + 0.5),
      attack: Math.sqrt(amount) * (Math.random() + 0.5),
      defense: Math.sqrt(amount) * (Math.random() + 0.5),
      health: amount * 10 * (Math.random() + 0.5),
      power: amount * (Math.random() + 0.5),
      stamina: amount * Math.sqrt(amount) * (Math.random() + 0.5),
    };
    this.start(fighter, enemy);
  }

  start(left, right) {
    this.fighters = [{stats:left, currentHealth: left.health}, {stats:right, currentHealth: right.health}];
    this.state = FIGHT_STARTED;
  }

  attack(who) {
    if(!who) {
      const you = this.fighters[0];
      const them = this.fighters[1];
      if(you.stats.attack * Math.random() < them.stats.defense * Math.random()) {
        const damage = you.stats.power * Math.random();
        them.currentHealth -= damage;
        if(them.currentHealth < 0) {
          this.state = FIGHT_WON;
          return 'You win!!!!';
        }
        return 'You hit \'im';
      }
      return 'You missed :(';
    }
    return 'They attacks!';
  }

  finish() {
    if(this.state === FIGHT_WON) {
      this.fighters[0].stats.train('skill', 1);
      this.fighters[0].stats.gold += this.bet;

      this.bet = 0;
      this.state = FIGHT_NOT_STARTED;
    }
  }
}


export default React.createContext(new Fight());
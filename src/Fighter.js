import React from 'react';
import {makeAutoObservable} from 'mobx';


class Fighter {
  constructor() {
    // Innate stats
    // Affect training result
    this.innateSpeed = 1;
    this.innateStrength = 1;
    this.vitality = 1;
    this.willpower = 1;
    // Affect combat directly
    this.durability = 1;
    this.reach = 1;

    // Exnate stats
    this.constitution = 1;
    this.skill = 1;
    this.speed = 1;
    this.strength = 1;
    this.stamina = 1;

    makeAutoObservable(this, {}, {autoBind: true});
  }

  // Combat stats (derived)
  get apm() {
    return Math.log(this.speed) + Math.sqrt(this.skill);
  }
  get attack() {
    return Math.log(this.stamina) + Math.sqrt(this.speed) + this.skill + this.reach;
  }
  get defense() {
    return Math.log(this.speed) + Math.sqrt(this.stamina) + this.skill;
  }
  get health() {
    return this.stamina + this.constitution * this.constitution + this.durability * this.durability;
  }
  get power() {
    return (this.strength + this.speed) * Math.sqrt(this.stamina) + this.skill;
  }
  // Fight rules
  //
  // Increase turn meter +apm (or onClick)
  // if(turnMeter > ?)
  //   randomly pick a move (e.g. spearhand)
  //   turnMeter -= moveCost
  //   if(moveAttack + fighterAttack + random > defense + random)
  //      enemyHealth -= movePower + fighterPower + random
  // Stamina decrease as the fight continues?


  train(stat) {
    const trainingEffect = {
      constitution: this.vitality, skill: this.willpower, speed: this.innateSpeed, strength: this.innateStrength, stamina: this.vitality,
    };
    if(Object.keys(trainingEffect).includes(stat)) {
      this[stat] += trainingEffect[stat];
    }
    else {
      console.error('Tried to train unknown stat:', stat);
    }
  }
}


export default React.createContext(new Fighter());
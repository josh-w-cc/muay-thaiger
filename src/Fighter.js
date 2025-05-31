import React from 'react';
import {makeAutoObservable} from 'mobx';


class Fighter {
  constructor() {
    // Innate stats
    this.durability = 1;
    this.innateSpeed = 1;
    this.innateStrength = 1;
    this.reach = 1;
    this.vitality = 1;
    this.willpower = 1;

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
    return this.stamina + this.constitution + this.durability * this.durability;
  }
  get power() {
    return this.strength + this.speed + this.skill;
  }


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
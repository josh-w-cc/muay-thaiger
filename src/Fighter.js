import React from 'react';
import {makeAutoObservable} from 'mobx';


class Fighter {
  constructor() {
    // Innate stats
    // Affect training result
    this.innateSpeed = 1;
    this.innateStrength = 1;
    this.vitality = 1;
    this.anima = 1;
    // Affect combat directly
    this.durability = 1;
    this.reach = 1;

    // Exnate stats
    this.constitution = 1;
    this.skill = 1;
    this.speed = 1;
    this.strength = 1;
    this.stamina = 1;

    this.idling = false;

    makeAutoObservable(this, {}, {autoBind: true});

    setInterval(this.tick, 10);
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

  idle(key, action) {
    this.idling = {key, action, lastAction: +new Date()};
  }

  tick() {
    if(!this.idling?.action) {
      return;
    }
    if(this.idling.lastAction < +new Date()) {
      const last = this.idling.lastAction;
      this.idling.lastAction = last ? last + 1000 : +new Date();
      this.idling.action();
    }
  }

  train(stat, idle = false) {
    if(idle) {
      this.idle(`train-${stat}`, () => this.train(stat));
      return;
    }
    const trainingEffect = {
      constitution: this.vitality,
      skill: this.anima,
      speed: this.innateSpeed,
      strength: this.innateStrength,
      stamina: this.vitality,
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
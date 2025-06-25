import React from 'react';
import {makeAutoObservable} from 'mobx';

import BaseStats from './menus/CharacterSelect/BaseStats.jsx';


class Fighter {
  constructor() {
    this.gold = 0;
    this.select(Object.keys(BaseStats).pop()); // Select whatever for initialization

    makeAutoObservable(this, {}, {autoBind: true});

    setInterval(this.tick, 10);
  }

  // Combat stats (derived)
  get apm() {
    return Math.max(0, Math.log(this.speed)) + Math.sqrt(this.skill);
  }
  get attack() {
    return Math.log(this.stamina) + Math.sqrt(this.speed) + this.skill + this.reach;
  }
  get defense() {
    return Math.max(0, Math.log(this.speed)) + Math.sqrt(this.stamina) + this.skill;
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

  select(id) {
    const stats = BaseStats[id].stats;

    this.race = id;
    // Affect training result
    this.innateSpeed = stats.innateSpeed;
    this.innateStrength = stats.innateStrength;
    this.vitality = stats.vitality;
    this.anima = stats.anima;
    // Affect combat directly
    this.durability = stats.durability;
    this.reach = stats.reach;

    // Exnate stats
    this.constitution = this.skill = this.speed = this.strength = this.stamina = 0;

    this.idling = false;
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

  train(stat, amount = 1) {
    const trainingEffect = {
      constitution: this.vitality,
      skill: this.anima,
      speed: this.innateSpeed,
      strength: this.innateStrength,
      stamina: this.vitality,
    };
    if(Object.keys(trainingEffect).includes(stat)) {
      this[stat] += trainingEffect[stat] * amount;
    }
    else {
      console.error('Tried to train unknown stat:', stat);
    }
  }
}


export default React.createContext(new Fighter());
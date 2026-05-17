import React from 'react';
import {makeAutoObservable} from 'mobx';

import BaseStats from './menus/CharacterSelect/BaseStats.jsx';
import {TickerState} from '../../pages/Game/Ticker.js';


class Fighter {
  constructor() {
    this.idling = false;
    this.gold = 0;
    this.select(Object.keys(BaseStats).pop()); // Select whatever for initialization

    TickerState.addListener((delta) => this.tick(delta));
    makeAutoObservable(this, {}, {autoBind: true});
  }

  // Combat stats (derived)
  get apm() {
    return Math.max(0, Math.log(this.agility)) + Math.sqrt(this.skill);
  }

  get attack() {
    return Math.max(0, Math.log(this.stamina)) + Math.sqrt(this.agility) + this.skill + this.reach;
  }

  get defense() {
    return Math.max(0, Math.log(this.agility)) + Math.sqrt(this.stamina) + this.skill;
  }

  get health() {
    return this.stamina + this.constitution * this.constitution + this.durability * this.durability;
  }

  get power() {
    return (this.strength + this.agility) * Math.sqrt(this.stamina) + this.skill;
  }

  idle(key, action) {
    if(this.idling?.key?.substring(0, 5).toUpperCase() === 'FIGHT') {
      return;
    }
    this.idling = {key, action, delta: 0};
  }

  select(id) {
    const stats = BaseStats[id].stats;

    this.race = id;
    // Affect training result
    this.speed = stats.speed;
    this.innateStrength = stats.strength;
    this.vitality = stats.vitality;
    this.anima = stats.anima;
    // Affect combat directly
    this.durability = stats.durability;
    this.reach = stats.reach;

    // Exnate stats
    this.constitution = this.skill = this.agility = this.strength = this.stamina = 0;
  }

  train(stat, amount = 1) {
    if(this.idling?.key?.substring(0, 5).toUpperCase() === 'FIGHT') {
      return;
    }
    const trainingEffect = {
      constitution: this.vitality,
      skill: this.anima,
      agility: this.speed,
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

  tick(delta) {
    if(this.idling?.action) {
      if(this.idling.key.substring(0, 5).toLowerCase() === 'train') { // Kinda janky?
        this.idling.delta += delta;
        if(this.idling.delta > 1000) {
          this.idling.action();
          this.idling.delta -= 1000;
        }
      }
      else {
        if(this.idling.action(delta)) {
          this.idling = false;
        }
      }
    }
  }

  win(gold) {
    this.gold += gold;
  }

  spend(gold) {
    this.gold -= gold;
  }
}


export default React.createContext(new Fighter());

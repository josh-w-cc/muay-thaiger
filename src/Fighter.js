import React from 'react';
import {makeAutoObservable} from 'mobx';


class Fighter {
  constructor() {
    this.speed = 1;
    this.strength = 1;
    this.vitality = 1;

    makeAutoObservable(this, {}, {autoBind: true});
  }

  train(stat) {
    const safeStats = ['speed', 'strength', 'vitality'];
    if(safeStats.includes(stat)) {
      this[stat]++;
    }
    else {
      console.error('Tried to train unknown stat:', stat);
    }
  }
}


export default React.createContext(new Fighter());
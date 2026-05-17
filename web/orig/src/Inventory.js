import React from 'react';
import {makeAutoObservable} from 'mobx';

import {TickerState} from './Ticker.js';


class Inventory {
  constructor() {
    this.items = [];

    TickerState.addListener((delta) => this.tick(delta));
    makeAutoObservable(this, {}, {autoBind: true});
  }

  buy(fighter, item) {
    if(fighter.gold < item.cost * 100) {
      return;
    }
    this.items.push(item);
    fighter.spend(item.cost * 100);
  }

  tick(delta) {
    console.log(delta);
    console.log(this.items);
  }
}


export default React.createContext(new Inventory());

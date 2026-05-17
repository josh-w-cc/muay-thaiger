import React from 'react';
import {makeAutoObservable} from 'mobx';


class Ticker {
  constructor() {
    this.actions = [];
    this.lastAction = +new Date();

    makeAutoObservable(this, {}, {autoBind: true});

    setInterval(this.tick, 10);
  }


  addListener(action) {
    this.actions.push(action);
  }

  tick() {
    if(!this.actions.length) {
      return;
    }
    const now = +new Date();
    if(this.lastAction < now) {
      const delta = now - this.lastAction;
      this.lastAction = now;
      this.actions.forEach((action) => action(delta));
    }
  }
}


export const TickerState = new Ticker();
export default React.createContext(TickerState);

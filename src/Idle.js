import React from 'react';
import {makeAutoObservable} from 'mobx';


class Idle {
  constructor() {
    this.action = false;
    this.key = '';
    this.lastAction = +new Date();
    this.fractional = false;

    makeAutoObservable(this, {}, {autoBind: true});

    setInterval(this.tick, 10);
  }


  start(key, action, fractional) {
    this.action = action;
    this.key = key;
    this.lastAction = +new Date();
    this.fractional = fractional;
  }

  stop() {
    this.action = null;
    this.key = '';
  }

  tick() {
    if(!this.action) {
      return;
    }
    if(this.lastAction < +new Date()) {
      if(this.fractional) {
        if(this.action(+new Date() - this.lastAction)) {
          this.stop();
        }
        this.lastAction = +new Date();
      }
      else {
        this.lastAction = this.lastAction ? this.lastAction + 1000 : +new Date();
        this.action();
      }
    }
  }
}


export const IdleState = new Idle();
export default React.createContext(IdleState);
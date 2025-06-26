import React from 'react';
import {makeAutoObservable} from 'mobx';


class Idle {
  constructor() {
    this.idling = false;

    makeAutoObservable(this, {}, {autoBind: true});

    setInterval(this.tick, 10);
  }


  start(key, action) {
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
}


export default React.createContext(new Idle());
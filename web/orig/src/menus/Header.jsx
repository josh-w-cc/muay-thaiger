import React from 'react';

import Button from '../components/Button';
import FightButton from '../assets/FightButton.png';
import HubButton from '../assets/HubButton.png';
import ShopButton from '../assets/ShopButton.png';
import TrainButton from '../assets/TrainButton.png';

import css from './Header.module.css';


function Header({setScreen}) {
  return (<div className={css.header}>
    <Button onClick={() => setScreen('fight')}><img src={FightButton} /></Button>
    <Button onClick={() => setScreen('hub')}><img src={HubButton} /></Button>
    <Button onClick={() => setScreen('shop')}><img src={ShopButton} /></Button>
    <Button onClick={() => setScreen('train')}><img src={TrainButton} /></Button>
  </div>);
}

export default Header;

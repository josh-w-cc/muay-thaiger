import React from 'react';

import Button from '../components/Button';
import FightButton from '../assets/FightButton.png';
import HubButton from '../assets/HubButton.png';
import TrainButton from '../assets/TrainButton.png';

function HeaderButton ({onClick, children}) {
  return (<Button onClick={onClick}>
    {children}
  </Button>);
}

function Header({setScreen}) {
  return (<>
    <HeaderButton onClick={() => setScreen('fight')}><img src ={FightButton} width={250} /></HeaderButton>
    <HeaderButton onClick={() => setScreen('hub')}><img src ={HubButton} width={200} /></HeaderButton>
    <HeaderButton onClick={() => setScreen('train')}><img src ={TrainButton} width={250} /></HeaderButton>
  </>);
}

export default Header;

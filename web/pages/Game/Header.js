import Button from '../../orig/src/components/Button.jsx';
import FightButton from '../../orig/src/assets/FightButton.png';
import HubButton from '../../orig/src/assets/HubButton.png';
import TrainButton from '../../orig/src/assets/TrainButton.png';

import css from './Header.module.css';


export default function Header({setScreen}) {
  return (
    <div className={css.header}>
      <Button onClick={() => setScreen('fight')}><img src={FightButton} /></Button>
      <Button onClick={() => setScreen('hub')}><img src={HubButton} /></Button>
      <Button onClick={() => setScreen('train')}><img src={TrainButton} /></Button>
      <Button onClick={() => setScreen('shop')}>SHOP</Button>
    </div>
  );
}

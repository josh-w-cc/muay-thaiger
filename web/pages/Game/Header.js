import Button from '../../orig/src/components/Button';
import FightButton from '../../orig/src/assets/FightButton.png';
import HubButton from '../../orig/src/assets/HubButton.png';
import ShopButton from '../../orig/src/assets/ShopButton.png';
import TrainButton from '../../orig/src/assets/TrainButton.png';

import css from './Header.module.css';


export default function Header({setScreen}) {
  return (
    <div className={css.header}>
      <Button onClick={() => setScreen('fight')}><img alt="Fight" className={css.navImage} src={FightButton} /></Button>
      <Button onClick={() => setScreen('hub')}><img alt="Hub" className={css.navImage} src={HubButton} /></Button>
      <Button onClick={() => setScreen('shop')}><img alt="Shop" className={css.navImage} src={ShopButton} /></Button>
      <Button onClick={() => setScreen('train')}><img alt="Train" className={css.navImage} src={TrainButton} /></Button>
    </div>
  );
}

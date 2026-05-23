import {useNavigate} from 'react-router-dom';

import Button from '@/components/Button.js';
import FightButton from './assets/FightButton.png';
import HubButton from '../../orig/src/assets/HubButton.png';
import ShopButton from '../../orig/src/assets/ShopButton.png';
import TrainButton from '../../orig/src/assets/TrainButton.png';

import css from './Header.module.css';

export default function Header() {
  const navigate = useNavigate();

  return (
    <div className={css.header}>
      <Button onClick={() => navigate('/fight')}><img alt="Fight" className={css.navigationImage} src={FightButton} /></Button>
      <Button onClick={() => navigate('/hub')}><img alt="Hub" className={css.navigationImage} src={HubButton} /></Button>
      <Button onClick={() => navigate('/train')}><img alt="Train" className={css.navigationImage} src={TrainButton} /></Button>
      <Button onClick={() => navigate('/shop')}><img alt="Shop" className={css.navigationImage} src={ShopButton} /></Button>
    </div>
  );
}

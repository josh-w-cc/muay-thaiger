import {useNavigate} from 'react-router-dom';

import Button from '@/components/Button.js';
import FightButton from './assets/FightButton.png';
import HubButton from './assets/HubButton.png';
import ShopButton from './assets/ShopButton.png';
import TrainButton from './assets/TrainButton.png';

import css from './Header.module.css';

export default function Header() {
  const navigate = useNavigate();

  return (
    <div className={css.header}>
      <Button className={css.navigationButton} onClick={() => navigate('/fight')}>
        <img alt="Fight" className={css.navigationImage} src={FightButton} />
      </Button>
      <Button className={css.navigationButton} onClick={() => navigate('/hub')}>
        <img alt="Hub" className={css.navigationImage} src={HubButton} />
      </Button>
      <Button className={css.navigationButton} onClick={() => navigate('/train')}>
        <img alt="Train" className={css.navigationImage} src={TrainButton} />
      </Button>
      <Button className={css.navigationButton} onClick={() => navigate('/shop')}>
        <img alt="Shop" className={css.navigationImage} src={ShopButton} />
      </Button>
    </div>
  );
}

import React from 'react';
import {useLocation, useNavigate} from 'react-router-dom';

import Button from '@/components/Button.js';
import FightButton from './assets/FightButton.png';
import HubButton from './assets/HubButton.png';
import ShopButton from './assets/ShopButton.png';
import TrainButton from './assets/TrainButton.png';

import css from './NavHeader.module.css';

const NAVIGATION_ITEMS = [
  {icon: FightButton, label: 'Fight', route: '/fight'},
  {icon: HubButton, label: 'Hub', route: '/hub'},
  {icon: TrainButton, label: 'Train', route: '/train'},
  {icon: ShopButton, label: 'Shop', route: '/shop'},
];

export default function NavHeader() {
  const {pathname} = useLocation();
  const headerRef = React.useRef();
  const navigate = useNavigate();

  React.useEffect(() => {
    const currentButton = headerRef.current?.querySelector('[aria-current="page"]');

    if(typeof currentButton?.scrollIntoView === 'function') {
      currentButton.scrollIntoView({block: 'nearest', inline: 'center'});
    }
  }, [pathname]);

  return (
    <div className={css.header} ref={headerRef}>
      {NAVIGATION_ITEMS.map((item) => <NavigationButton item={item} key={item.label} navigate={navigate} pathname={pathname} />)}
    </div>
  );
}

function getIsCurrentPage(pathname, route) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

function NavigationButton({item, navigate, pathname}) {
  const isCurrentPage = getIsCurrentPage(pathname, item.route);

  return (
    <Button aria-current={isCurrentPage ? 'page' : undefined} className={css.navigationButton} onClick={() => navigate(item.route)}>
      {isCurrentPage ? <span className={css.navigationMask} style={{'--navigation-mask': `url(${item.icon})`}} /> : null}
      <img alt={item.label} className={css.navigationImage} src={item.icon} />
    </Button>
  );
}

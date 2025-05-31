import React from 'react';

import css from './Header.module.css';
import Button from '../components/Button'

function HeaderButton ({onClick, children}) {
  return (<Button className={css.button} onClick={onClick}>
    MENU: {children}
  </Button>);
}

function Header({setScreen}) {
  return (<>
    <HeaderButton onClick={() => setScreen('fight')}>Fight</HeaderButton>
    <HeaderButton onClick={() => setScreen('hub')}>Hub</HeaderButton>
    <HeaderButton onClick={() => setScreen('train')}>Train</HeaderButton>
  </>);
}

export default Header;

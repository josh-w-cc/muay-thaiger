import React from 'react';

import css from './Header.module.css';

function HeaderButton ({onClick, children}) {
  return (<button className={css.button} onClick={onClick}>
    MENU: {children}
  </button>);
}

function Header({setScreen}) {
  return (<>
    <HeaderButton onClick={() => setScreen('fight')}>Fight</HeaderButton>
    <HeaderButton onClick={() => setScreen('hub')}>Hub</HeaderButton>
    <HeaderButton onClick={() => setScreen('train')}>Train</HeaderButton>
  </>);
}

export default Header;

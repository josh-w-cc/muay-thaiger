import React from 'react';

import css from '../menus/Header.module.css';

function Button ({onClick, children}) {
  return (<button className={css.button} onClick={onClick}>
    {children}
  </button>);
}

export default Button;

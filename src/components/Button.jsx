import React from 'react';

import css from '../menus/Header.module.css';

function Button ({onClick, style, children}) {
  return (<button className={css.button} style={style} onClick={onClick}>
    I am a Button, {children}
  </button>);
}

export default Button;

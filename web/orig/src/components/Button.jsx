import React from 'react';

import css from './Button.module.css';

function Button ({onClick, style, children}) {
  return (<button className={css.button} style={style} onClick={onClick}>
    {children}
  </button>);
}

export default Button;

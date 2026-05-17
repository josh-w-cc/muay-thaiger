import React from 'react';

import css from './Button.module.css';

function Button ({children, className, onClick, style}) {
  const classes = [css.button, className].filter(Boolean).join(' ');
  return (<button className={classes} style={style} onClick={onClick}>
    {children}
  </button>);
}

export default Button;

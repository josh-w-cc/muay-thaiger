import cx from 'classnames';

import css from './Button.module.css';

function Button({children, className, onClick, style, ...rest}) {
  const classes = cx(css.button, className);

  return (
    <button className={classes} onClick={onClick} style={style} {...rest}>
      {children}
    </button>
  );
}

export default Button;

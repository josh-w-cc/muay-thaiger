import css from './Button.module.css';

function Button({children, className, onClick, style, ...rest}) {
  const classes = [css.button, className].filter(Boolean).join(' ');

  return (
    <button className={classes} onClick={onClick} style={style} {...rest}>
      {children}
    </button>
  );
}

export default Button;

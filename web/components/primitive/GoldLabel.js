import cx from 'classnames';

import css from './GoldLabel.module.css';


function GoldLabel({children, className}) {
  return (
    <span className={cx(css.goldLabel, className)}>
      {children}
    </span>
  );
}

export default GoldLabel;

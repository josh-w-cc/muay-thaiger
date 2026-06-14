import cx from 'classnames';

import css from './GoldLabel.module.css';


function GoldLabel({as: As = 'span', children, className}) {
  return (
    <As className={cx(css.goldLabel, className)}>
      {children}
    </As>
  );
}

export default GoldLabel;

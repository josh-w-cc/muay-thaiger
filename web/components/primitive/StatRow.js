import cx from 'classnames';

import css from './StatRow.module.css';


function StatRow({className, label, value}) {
  return (
    <div className={cx(css.statRow, className)}>
      <span className={css.label}>{label}</span>
      <span className={css.value}>{value}</span>
    </div>
  );
}

export default StatRow;

import cx from 'classnames';

import css from './css-modules/stat-list-base.module.css';

export default function StatList({as: Component = 'div', children, className}) {
  return (
    <Component className={cx(css.statListBase, className)}>
      {children}
    </Component>
  );
}

import cx from 'classnames';

import css from './css-modules/stat-list-base.module.css';

export default function StatList({as: Component = 'div', children, className, ...rest}) {
  return (
    <Component className={cx(css.statListBase, className)} {...rest}>
      {children}
    </Component>
  );
}

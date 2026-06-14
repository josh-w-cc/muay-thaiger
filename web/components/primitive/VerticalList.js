import cx from 'classnames';

import css from './VerticalList.module.css';


function VerticalList({as: As = 'ul', children, className}) {
  return (
    <As className={cx(css.verticalList, className)}>
      {children}
    </As>
  );
}

export default VerticalList;

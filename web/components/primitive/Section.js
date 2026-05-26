import cx from 'classnames';

import css from './Section.module.css';


function Section({className, children}) {
  return (
    <section className={cx(css.section, className)}>
      {children}
    </section>
  );
}

export default Section;

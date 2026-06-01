import cx from 'classnames';
import Button from '@/components/Button.js';

import {onActionButtonClick} from './skillButtons.js';

import css from './Train.module.css';

export default function RegimenActionButton({actionEnabled, skillKey}) {
  return (
    <Button className={cx(css.actionButton, {[css.idleActive]: actionEnabled})} onClick={() => onActionButtonClick({actionEnabled, skillKey})}>
      {actionEnabled ? 'STOP' : 'IDLE'}
    </Button>
  );
}

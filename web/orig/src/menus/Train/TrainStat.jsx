import React from 'react';

import formatHugeNumber from '@/utils/formatHugeNumber.js';
import useFighterStore from '../../Fighter.js';

import css from './Train.module.css';

function TrainStat({name, stat}) {
  const fighter = useFighterStore();

  return (
    <div className={css.stat}>
      <span className={css.label}>{name}</span>
      <span className={css.value}>{formatHugeNumber(fighter[stat])}</span>
    </div>
  );
}
export default TrainStat;

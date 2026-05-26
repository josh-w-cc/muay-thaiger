import useFighterStore from '@/data/fighter.js';

import css from './TrainStat.module.css';

export default function TrainStat({name, stat}) {
  const fighter = useFighterStore();

  return (
    <div className={css.stat}>
      <span className={css.label}>{name}</span>
      <span className={css.value}>{fighter[stat].toFormattedNumber()}</span>
    </div>
  );
}

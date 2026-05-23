import BaseStats from '@/data/baseStats.js';
import useFighterStore from '@/data/fighter.js';

import css from './Hub.module.css';

export default function FighterDetails() {
  const fighter = useFighterStore();
  const raceName = BaseStats[fighter.race]?.name ?? '—';
  const ageHours = getFighterAgeHours(fighter.createdAt);
  const fields = [
    {label: 'Name', value: fighter.displayName || '—'},
    {label: 'Race', value: raceName},
    {label: 'Age', value: ageHours !== null ? `${ageHours}h` : '—'},
  ];

  return (
    <dl className={css.details}>
      {fields.map(({label, value}) => (
        <div className={css.stat} key={label}>
          <dt className={css.label}>{label}</dt>
          <dd className={css.value}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function getFighterAgeHours(createdAt) {
  if(!createdAt) {
    return null;
  }
  const ms = Date.now() - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60)));
}

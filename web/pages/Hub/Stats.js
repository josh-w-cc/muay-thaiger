import useFighterStore from '@/data/fighter.js';
import formatHugeNumber from '@/utils/formatHugeNumber.js';
import {formatGoldStat} from '@/utils/gold.js';

import css from './Hub.module.css';

const STAT_FIELDS = [
  {key: 'agility', label: 'Agility'},
  {key: 'speed', label: 'Speed'},
  {key: 'strength', label: 'Strength'},
  {key: 'vigor', label: 'Vigor'},
  {key: 'vitality', label: 'Vitality'},
  {key: 'anima', label: 'Anima'},
  {key: 'durability', label: 'Durability'},
  {key: 'reach', label: 'Reach'},
  {key: 'constitution', label: 'Constitution'},
  {key: 'skill', label: 'Skill'},
  {key: 'stamina', label: 'Stanima'},
  {key: 'gold', label: '฿'},
  {key: 'apm', label: 'APM'},
  {key: 'attack', label: 'Attack'},
  {key: 'defense', label: 'Defense'},
  {key: 'health', label: 'Health'},
  {key: 'power', label: 'Power'},
];

export default function Stats() {
  const fighter = useFighterStore();

  return (
    <>
      <h3>Stats:</h3>
      <dl className={css.stats}>
        {STAT_FIELDS.map(({key, label}) => (
          <Stat key={key} label={label} value={formatStatValue({fighter, key})} />
        ))}
      </dl>
    </>
  );
}

function formatStatValue({fighter, key}) {
  if(key === 'gold') {
    return formatGoldStat(fighter.gold);
  }

  return formatHugeNumber(fighter[key]);
}

function Stat({label, value}) {
  return (
    <div className={css.stat}>
      <dt className={css.label}>{label}</dt>
      <dd className={css.value}>{value}</dd>
    </div>
  );
}

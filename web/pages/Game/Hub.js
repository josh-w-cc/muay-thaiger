import formatHugeNumber from '@/utils/formatHugeNumber.js';
import useFighterStore from '@/orig/src/Fighter.js';

import css from './Hub.module.css';

const STAT_FIELDS = [
  {key: 'agility', label: 'Agility'},
  {key: 'speed', label: 'Speeed'},
  {key: 'strength', label: 'Strength'},
  {key: 'innateStrength', label: 'Innate Strength'},
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

function Hub() {
  const fighter = useFighterStore();

  return (
    <>
      <h1>HUB</h1>
      <h3>Stats:</h3>
      <dl className={css.stats}>
        {STAT_FIELDS.map(({key, label}) => (
          <Stat key={key} label={label} value={formatHugeNumber(getStatValue({fighter, key}))} />
        ))}
      </dl>
    </>
  );
}

function getStatValue({fighter, key}) {
  if(key === 'gold') {
    return fighter.gold / 100;
  }
  return fighter[key];
}

function Stat({label, value}) {
  return (
    <div className={css.stat}>
      <dt className={css.label}>{label}</dt>
      <dd className={css.value}>{value}</dd>
    </div>
  );
}

export default Hub;

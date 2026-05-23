import formatHugeNumber from '@/utils/formatHugeNumber.js';
import useFighterStore from '@/data/fighter.js';

import FighterDetails from './FighterDetails.js';
import css from './Hub.module.css';

const STAT_FIELDS = [
  {key: 'agility', label: 'Agility'},
  {key: 'speed', label: 'Speed'},
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

const EVENTS = [
  {
    detail: 'Unlocked Flying Knee Drill in Training.',
    outcome: 'Unlocked',
    title: 'Technique: Flying Knee Drill',
  },
  {
    detail: 'Won against Iron Cobra in the Lumpinee Bracket.',
    outcome: 'Tournament Win',
    title: 'Lumpinee Rookie Cup',
  },
  {
    detail: 'Clinched 3 rounds in sparring and gained +2 Skill.',
    outcome: 'Skill Gain',
    title: 'Camp Sparring Session',
  },
];

export default function Hub() {
  const fighter = useFighterStore();

  return (
    <>
      <h1>HUB</h1>
      <section className={css.section}>
        <h3>Fighter Details:</h3>
        <FighterDetails fighter={fighter} />
      </section>
      <section className={css.section}>
        <h3>Stats:</h3>
        <FighterStats fighter={fighter} />
      </section>
      <section className={css.section}>
        <Events />
      </section>
    </>
  );
}

function FighterStats({fighter}) {
  return (
    <dl className={css.stats}>
      {STAT_FIELDS.map(({key, label}) => (
        <Stat key={key} label={label} value={formatHugeNumber(getStatValue({fighter, key}))} />
      ))}
    </dl>
  );
}

function Events() {
  return (
    <>
      <ul className={css.events}>
        {EVENTS.map((event) => <Event event={event} key={event.title} />)}
      </ul>
    </>
  );
}

function Event({event}) {
  return (
    <li className={css.event}>
      <span className={css.outcome}>{event.outcome}</span>
      <strong>{event.title}</strong>
      <span>{event.detail}</span>
    </li>
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

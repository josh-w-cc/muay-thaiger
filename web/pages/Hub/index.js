import {SKILL_SEED_ACTIONS} from 'shared/skills.js';
import formatHugeNumber from '@/utils/formatHugeNumber.js';
import useFighterActionsStore from '@/data/fighterActions.js';
import useFighterStore from '@/data/fighter.js';

import css from './Hub.module.css';

const ACTIONS_BY_ID = Object.fromEntries(SKILL_SEED_ACTIONS.map((action) => [action.id, action]));

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

export default function Hub() {
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
      <Events />
    </>
  );
}

function Events() {
  const {actions} = useFighterActionsStore();
  return (
    <>
      <h3>Events:</h3>
      <ul className={css.events}>
        {actions.map((action) => <Event action={action} key={action.id ?? action.action_id} />)}
      </ul>
    </>
  );
}

function Event({action}) {
  const skill = ACTIONS_BY_ID[action.action_id];
  return (
    <li className={css.event}>
      <span className={css.outcome}>{skill?.type}</span>
      <strong>{skill?.name}</strong>
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

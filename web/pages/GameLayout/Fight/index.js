/* eslint-disable complexity, max-lines-per-function */
import React from 'react';

import useFighterStore from '@/data/fighter.js';
import useFightStore, {FIGHT_IN_PROGRESS, FIGHT_NOT_STARTED, FIGHT_LOST, FIGHT_WON} from '@/data/fight.js';
import Button from '@/components/Button.js';

import ZerothFight, {needsZerothFight} from './ZerothFight.js';
import css from './Fight.module.css';


function FightMenu() {
  const fight = useFightStore();
  const fighter = useFighterStore();
  const [announcer, setAnnouncer] = React.useState('');
  const [risk, setRisk] = React.useState(1);

  if(needsZerothFight(fighter)) {
    return (<ZerothFight />);
  }

  let content;
  if(fight.state === FIGHT_NOT_STARTED) {
    content = (
      <>
        Risk:
        {' '}
        <select onChange={(e) => setRisk(e.target.options[e.target.selectedIndex].value)}>
          <option value={0}>Minimal</option>
          <option value={1}>Low</option>
          <option value={2}>Moderate</option>
          <option value={3}>High</option>
          <option value={4}>ALL!</option>
        </select>
        <Button onClick={() => fight.forGold(fighter, risk)}>Fight!</Button>
      </>
    );
  }
  else if(fight.state === FIGHT_IN_PROGRESS) {
    const [you, them] = fight.fighters;
    content = (
      <>
        <h3>Enemy Stats:</h3>
        APM:
        {' '}
        {BigInt(them.stats.apm).toFormattedNumber()}
        <br />
        Attack:
        {' '}
        {BigInt(them.stats.attack).toFormattedNumber()}
        <br />
        Defense:
        {' '}
        {BigInt(them.stats.defense).toFormattedNumber()}
        <br />
        Health:
        {' '}
        {BigInt(them.stats.health).toFormattedNumber()}
        <br />
        Power:
        {' '}
        {BigInt(them.stats.power).toFormattedNumber()}
        <br />
        Stanima:
        {' '}
        {BigInt(them.stats.stamina).toFormattedNumber()}
        <br />
        Health:
        {' '}
        {BigInt(them.currentHealth).toFormattedNumber()}
        <br />
        <Button onClick={() => setAnnouncer(fight.attack(0))}>Attack!</Button>
        <h3>Stats:</h3>
        Health:
        {' '}
        {BigInt(you.currentHealth).toFormattedNumber()}
        <h3>MSG</h3>
      </>
    );
  }
  else if(fight.state === FIGHT_WON || fight.state === FIGHT_LOST) {
    content = (
      <Button onClick={() => {
        fight.finish();
        setAnnouncer('');
      }}
      >
        Again?
      </Button>
    );
  }
  return (
    <section className={css.section}>
      <h1>Fight for ฿</h1>
      <h2>{announcer}</h2>
      {content}
      {fight.messages.slice().reverse()}
    </section>
  );
}

export default FightMenu;

/* eslint-disable complexity, max-lines-per-function */
import React from 'react';

import {parseBigIntStats} from 'shared/stats.js';

import useFighterStore from '@/data/fighter.js';
import useFightStore, {FIGHT_IN_PROGRESS, FIGHT_NOT_STARTED, FIGHT_LOST, FIGHT_WON} from '@/data/fight.js';
import {createFightCmd} from '@/actions/websockets/clientCommands.js';
import Button from '@/components/Button.js';
import Section from '@/components/primitive/Section.js';

import FightForGlory from './FightForGlory/index.js';
import ZerothFight, {needsZerothFight} from './ZerothFight.js';


export default function FightMenu() {
  const fight = useFightStore();
  const fighter = useFighterStore();
  const [announcer, setAnnouncer] = React.useState('');

  if(needsZerothFight(fighter)) {
    return (<ZerothFight />);
  }

  let content;
  if(fight.state === FIGHT_NOT_STARTED) {
    content = (
      <>
        <Button onClick={() => createFightCmd()}>Fight!</Button>
      </>
    );
  }
  else if(fight.state === FIGHT_IN_PROGRESS) {
    const [you, them] = fight.fighters;
    const themStats = parseBigIntStats(them.stats);
    const youCurrentHealth = BigInt(Math.floor(Number(you.currentHealth)));
    const themCurrentHealth = BigInt(Math.floor(Number(them.currentHealth)));
    content = (
      <>
        <h3>Enemy Stats:</h3>
        APM:
        {' '}
        {themStats.apm.toFormattedNumber()}
        <br />
        Attack:
        {' '}
        {themStats.attack.toFormattedNumber()}
        <br />
        Defense:
        {' '}
        {themStats.defense.toFormattedNumber()}
        <br />
        Health:
        {' '}
        {themStats.health.toFormattedNumber()}
        <br />
        Power:
        {' '}
        {themStats.power.toFormattedNumber()}
        <br />
        Stanima:
        {' '}
        {themStats.stamina.toFormattedNumber()}
        <br />
        Health:
        {' '}
        {themCurrentHealth.toFormattedNumber()}
        <br />
        <Button onClick={() => setAnnouncer(fight.attack(0))}>Attack!</Button>
        <h3>Stats:</h3>
        Health:
        {' '}
        {youCurrentHealth.toFormattedNumber()}
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
    <>
      <Section>
        <h1>Fight for ฿</h1>
        <h2>{announcer}</h2>
        {content}
        {fight.messages.slice().reverse()}
      </Section>
      <FightForGlory />
    </>
  );
}

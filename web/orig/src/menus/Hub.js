import React from 'react';

import formatHugeNumber from "@/utils/formatHugeNumber.js";
import useFighterStore from '../Fighter.js';

import css from './Hub.module.css';

function Hub() {
  const fighter = useFighterStore();

  return (
    <>
      <h1>HUB</h1>
      <h3>Stats:</h3>
      <dl className={css.stats}>
        <div className={css.stat}>
          <dt className={css.label}>Agility</dt>
          <dd className={css.value}>{formatHugeNumber(fighter.agility)}</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.label}>Speeed</dt>
          <dd className={css.value}>{formatHugeNumber(fighter.speed)}</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.label}>Strength</dt>
          <dd className={css.value}>{formatHugeNumber(fighter.strength)}</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.label}>Innate Strength</dt>
          <dd className={css.value}>{formatHugeNumber(fighter.innateStrength)}</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.label}>Vitality</dt>
          <dd className={css.value}>{formatHugeNumber(fighter.vitality)}</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.label}>Anima</dt>
          <dd className={css.value}>{formatHugeNumber(fighter.anima)}</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.label}>Durability</dt>
          <dd className={css.value}>{formatHugeNumber(fighter.durability)}</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.label}>Reach</dt>
          <dd className={css.value}>{formatHugeNumber(fighter.reach)}</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.label}>Constitution</dt>
          <dd className={css.value}>{formatHugeNumber(fighter.constitution)}</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.label}>Skill</dt>
          <dd className={css.value}>{formatHugeNumber(fighter.skill)}</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.label}>Stanima</dt>
          <dd className={css.value}>{formatHugeNumber(fighter.stamina)}</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.label}>฿</dt>
          <dd className={css.value}>{formatHugeNumber(fighter.gold / 100)}</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.label}>APM</dt>
          <dd className={css.value}>{formatHugeNumber(fighter.apm)}</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.label}>Attack</dt>
          <dd className={css.value}>{formatHugeNumber(fighter.attack)}</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.label}>Defense</dt>
          <dd className={css.value}>{formatHugeNumber(fighter.defense)}</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.label}>Health</dt>
          <dd className={css.value}>{formatHugeNumber(fighter.health)}</dd>
        </div>
        <div className={css.stat}>
          <dt className={css.label}>Power</dt>
          <dd className={css.value}>{formatHugeNumber(fighter.power)}</dd>
        </div>
      </dl>
    </>
  );
}

export default Hub;

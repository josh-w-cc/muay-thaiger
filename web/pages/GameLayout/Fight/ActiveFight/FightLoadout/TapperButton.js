import React from 'react';

import Button from '@/components/Button.js';
import {TAPPER_FILL_DURATIONS} from '../fightData.js';

import css from './FightLoadout.module.css';


export default function TapperButton({delay, duration, children, lastUsed, onClick}) {
  const animationStyle = React.useMemo(
    () => getAnimationStyle(delay, duration, lastUsed),
    [delay, duration, lastUsed],
  );
  const animationKey = getAnimationKey(delay, lastUsed);
  return (
    <Button className={css.tapperButton} onClick={onClick}>
      <span
        aria-hidden="true"
        className={css.tapperButtonFill}
        key={animationKey}
        style={animationStyle}
      />
      <span className={css.tapperButtonLabel}>{children}</span>
    </Button>
  );
}

function getAnimationKey(delay, lastUsed) {
  const lastUsedTime = Number(lastUsed);
  if(Number.isFinite(lastUsedTime)) {
    return `last-used-${lastUsedTime}`;
  }
  return `delay-${delay}`;
}

function getAnimationStyle(delay, duration, lastUsed) {
  const normalizedDuration = duration ?? TAPPER_FILL_DURATIONS.at(-1);
  const animationDuration = `${normalizedDuration}s`;
  const lastUsedTime = Number(lastUsed);
  if(Number.isFinite(lastUsedTime)) {
    const elapsed = Math.max(0, (Date.now() - lastUsedTime) / 1000);
    if(elapsed > normalizedDuration) {
      return {animationDuration, animationName: 'none', transform: 'scaleX(0)'};
    }
    return {animationDelay: `-${elapsed}s`, animationDuration};
  }
  return {animationDelay: `${delay}s`, animationDuration};
}

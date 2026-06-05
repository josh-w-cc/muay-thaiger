import Button from '@/components/Button.js';

import {FIGHT_LOADOUT, TAPPER_FILL_DURATIONS} from './fightData.js';
import css from '../Fight.module.css';


export default function FightLoadout({details}) {
  const strategy = getFightStrategy(details);
  const moves = getFightMoves(details);
  const buttons = [
    `Strategy: ${strategy}`,
    ...moves.map((move) => `${move}`),
  ];

  return (
    <div className={css.fightLoadout}>
      <div className={css.fightLoadoutButtons}>
        {buttons.map((label, buttonIndex) => (
          <TapperButton delay={buttonIndex * 0.4} duration={TAPPER_FILL_DURATIONS[buttonIndex]} key={label}>{label}</TapperButton>
        ))}
      </div>
    </div>
  );
}

function getFightStrategy(details) {
  return details?.strategy ?? FIGHT_LOADOUT.strategy;
}

function getFightMoves(details) {
  if(Array.isArray(details?.attacker?.moves) && details.attacker.moves.length > 0) {
    return details.attacker.moves;
  }
  return FIGHT_LOADOUT.moves;
}

function TapperButton({delay, duration, children}) {
  return (
    <Button className={css.tapperButton}>
      <span
        aria-hidden="true"
        className={css.tapperButtonFill}
        style={{animationDelay: `${delay}s`, animationDuration: `${duration ?? TAPPER_FILL_DURATIONS.at(-1)}s`}}
      />
      <span className={css.tapperButtonLabel}>{children}</span>
    </Button>
  );
}

import Button from '@/components/Button.js';

import {FIGHT_LOADOUT, TAPPER_FILL_DURATIONS} from './fightData.js';
import css from '../Fight.module.css';


export default function FightLoadout() {
  const buttons = [
    `Strategy: ${FIGHT_LOADOUT.strategy}`,
    ...FIGHT_LOADOUT.moves,
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

function TapperButton({delay, duration, children}) {
  return (
    <Button className={css.tapperButton}>
      <span
        aria-hidden="true"
        className={css.tapperButtonFill}
        style={{animationDelay: `${delay}s`, animationDuration: `${duration}s`}}
      />
      <span className={css.tapperButtonLabel}>{children}</span>
    </Button>
  );
}

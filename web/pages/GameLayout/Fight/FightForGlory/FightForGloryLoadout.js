import Button from '@/components/Button.js';

import {FIGHT_FOR_GLORY_LOADOUT, TAPPER_FILL_DURATIONS} from './fightForGloryData.js';
import css from '../Fight.module.css';


export default function FightForGloryLoadout() {
  const buttons = [
    `Strategy: ${FIGHT_FOR_GLORY_LOADOUT.strategy}`,
    ...FIGHT_FOR_GLORY_LOADOUT.moves,
  ];

  return (
    <div className={css.gloryLoadout}>
      <div className={css.gloryLoadoutButtons}>
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

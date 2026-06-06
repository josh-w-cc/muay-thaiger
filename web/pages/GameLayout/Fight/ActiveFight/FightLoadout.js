import Button from '@/components/Button.js';
import useMovesStore from '@/data/moves.js';
import {moveCmd} from '@/actions/websockets/clientCommands.js';

import {FIGHT_LOADOUT, TAPPER_FILL_DURATIONS} from './fightData.js';
import css from '../Fight.module.css';


export default function FightLoadout({details}) {
  const moveDefinitions = useMovesStore((state) => state.moves);
  const strategy = getFightStrategy(details);
  const moves = getFightMoves(details, moveDefinitions);
  const buttons = [
    {duration: TAPPER_FILL_DURATIONS[0], label: `Strategy: ${strategy}`},
    ...moves,
  ];

  return (
    <div className={css.fightLoadout}>
      <FightLoadoutButtons buttons={buttons} />
    </div>
  );
}

function FightLoadoutButtons({buttons}) {
  return (
    <div className={css.fightLoadoutButtons}>
      {buttons.map((button, buttonIndex) => (
        <TapperButton
          delay={buttonIndex * 0.4}
          duration={button.duration ?? TAPPER_FILL_DURATIONS[buttonIndex]}
          key={button.label}
          onClick={() => moveCmd(button.moveID)}
        >
          {button.label}
        </TapperButton>
      ))}
    </div>
  );
}

function getFightStrategy(details) {
  return details?.strategy ?? FIGHT_LOADOUT.strategy;
}

function getFightMoves(details, moveDefinitions) {
  if(Array.isArray(details?.attacker?.moves) && details.attacker.moves.length > 0) {
    return details.attacker.moves.map((move) => ({
      ...getLoadoutMove(moveDefinitions, move.id),
      moveID: move.id,
    }));
  }
  return FIGHT_LOADOUT.moves.map((move) => ({label: move}));
}

function getLoadoutMove(moveDefinitions, moveID) {
  const moveDefinition = moveDefinitions.find((move) => move.id === moveID);
  if(!moveDefinition) {
    return {label: `${moveID}`};
  }
  return {
    duration: moveDefinition.recovery,
    label: moveDefinition.name,
  };
}

function TapperButton({delay, duration, children, onClick}) {
  return (
    <Button className={css.tapperButton} onClick={onClick}>
      <span
        aria-hidden="true"
        className={css.tapperButtonFill}
        style={{animationDelay: `${delay}s`, animationDuration: `${duration ?? TAPPER_FILL_DURATIONS.at(-1)}s`}}
      />
      <span className={css.tapperButtonLabel}>{children}</span>
    </Button>
  );
}

import useMovesStore from '@/data/moves.js';
import {moveCmd} from '@/actions/websockets/clientCommands.js';

import {FIGHT_LOADOUT, TAPPER_FILL_DURATIONS} from '../fightData.js';
import TapperButton from './TapperButton.js';

import css from './FightLoadout.module.css';


export default function FightLoadout({details, onMove}) {
  const moveDefinitions = useMovesStore((state) => state.moves);
  const strategy = getFightStrategy(details);
  const moves = getFightMoves(details, moveDefinitions);
  const buttons = [
    {duration: TAPPER_FILL_DURATIONS[0], label: `Strategy: ${strategy}`},
    ...moves,
  ];

  return (
    <div className={css.fightLoadout}>
      <FightLoadoutButtons buttons={buttons} onMove={onMove} />
    </div>
  );
}

function FightLoadoutButtons({buttons, onMove}) {
  return (
    <div className={css.fightLoadoutButtons}>
      {buttons.map((button, buttonIndex) => (
        <TapperButton
          delay={buttonIndex * 0.4}
          lastUsed={button.lastUsed}
          duration={button.duration ?? TAPPER_FILL_DURATIONS[buttonIndex]}
          key={button.label}
          onClick={() => (moveCmd(button.moveID, button.label), button.moveID !== undefined && onMove?.())}
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
      lastUsed: move.lastUsed,
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

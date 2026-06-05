import Button from '@/components/Button.js';
import {MOVE_SEED_MOVES} from 'shared/moves.js';

import {FIGHT_LOADOUT, TAPPER_FILL_DURATIONS} from './fightData.js';
import css from '../Fight.module.css';

const MOVE_NAME_BY_ID = Object.freeze(Object.fromEntries(MOVE_SEED_MOVES.map((move) => [move.id, move.name])));


export default function FightLoadout({details}) {
  const strategy = getFightStrategy(details);
  const moves = getFightMoves(details);
  const buttons = [
    `Strategy: ${strategy}`,
    ...moves,
  ];

  return (
    <div className={css.fightLoadout}>
      <div className={css.fightLoadoutButtons}>
        {buttons.map((label, buttonIndex) => (
          <TapperButton delay={buttonIndex * 0.4} duration={TAPPER_FILL_DURATIONS[buttonIndex]} key={`${buttonIndex}-${label}`}>{label}</TapperButton>
        ))}
      </div>
    </div>
  );
}

function getFightStrategy(details) {
  return details?.strategy ?? FIGHT_LOADOUT.strategy;
}

function getFightMoves(details) {
  const serverMoves = getServerMoves(details);
  if(serverMoves === null) {
    return FIGHT_LOADOUT.moves;
  }

  const labels = serverMoves
    .map((move) => getFightMoveLabel(move))
    .filter((moveLabel) => moveLabel !== null);

  return labels.length > 0 ? labels : FIGHT_LOADOUT.moves;
}

function getServerMoves(details) {
  const moves = details?.attacker?.moves;
  return Array.isArray(moves) && moves.length > 0 ? moves : null;
}

function getFightMoveLabel(move) {
  if(typeof move === 'string' && move.length > 0) {
    return move;
  }

  const moveID = getMoveID(move);
  if(moveID === null) {
    return null;
  }

  return MOVE_NAME_BY_ID[moveID] ?? `Move ${moveID}`;
}

function getMoveID(move) {
  if(move && typeof move === 'object') {
    return getMoveID(move.id);
  }

  if(typeof move === 'bigint') {
    return Number(move);
  }

  const moveID = Number(move);
  if(Number.isFinite(moveID)) {
    return moveID;
  }

  return null;
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

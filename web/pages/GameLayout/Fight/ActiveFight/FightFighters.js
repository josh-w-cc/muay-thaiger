import classnames from 'classnames';

import SnowLeopardMuayThaiReady from '../assets/SnowLeopardMuayThaiReady.png';
import TigerMuayThai from '../assets/TigerMuayThai.png';

import {
  FIGHT_FIGHTER_ATTACK,
  FIGHT_FIGHTER_DEFENSE,
  FIGHT_FIGHTER_HP,
  FIGHT_FIGHTER_STAMINA,
  FIGHT_OPPONENT_ATTACK,
  FIGHT_OPPONENT_DEFENSE,
  FIGHT_OPPONENT_HP,
  FIGHT_OPPONENT_STAMINA,
} from './fightData.js';
import css from '../Fight.module.css';

const tigerCard = {
  alt: 'Tiger Muay Thai fighter',
  attack: FIGHT_FIGHTER_ATTACK,
  className: css.fightFighterLeft,
  defense: FIGHT_FIGHTER_DEFENSE,
  hp: FIGHT_FIGHTER_HP,
  src: TigerMuayThai,
  stamina: FIGHT_FIGHTER_STAMINA,
};
const opponentCard = {
  alt: 'Snow leopard Muay Thai fighter',
  attack: FIGHT_OPPONENT_ATTACK,
  className: css.fightFighterRight,
  defense: FIGHT_OPPONENT_DEFENSE,
  hp: FIGHT_OPPONENT_HP,
  mirror: true,
  src: SnowLeopardMuayThaiReady,
  stamina: FIGHT_OPPONENT_STAMINA,
};

export default function FightFighters() {
  return (
    <>
      <div className={css.fightFighters}>
        <FightFighterCard {...tigerCard} />
        <div aria-orientation="vertical" className={css.fightFighterDivider} role="separator" />
        <FightFighterCard {...opponentCard} />
      </div>
      <div className={css.fightFighterStatsRow}>
        <FightFighterStats attack={tigerCard.attack} defense={tigerCard.defense} />
        <div aria-hidden className={css.fightFighterStatsDividerSpacer} />
        <FightFighterStats attack={opponentCard.attack} defense={opponentCard.defense} />
      </div>
    </>
  );
}

function FightFighterCard({alt, className, hp, mirror, src, stamina}) {
  return (
    <div className={classnames(css.fightFighter, className)}>
      <FightStatBar barClassName={css.fightStaminaBar} current={stamina.current} label={stamina.label} max={stamina.max} />
      <img
        alt={alt}
        className={classnames(css.fightFighterImage, {[css.fightFighterImageMirror]: mirror})}
        src={src}
      />
      <FightStatBar barClassName={css.fightHealthBar} current={hp.current} label={hp.label} max={hp.max} />
    </div>
  );
}

function FightFighterStats({attack, defense}) {
  return (
    <div className={css.fightFighterStats}>
      <span>{`A: ${attack.toFormattedNumber()}`}</span>
      <span>{`D: ${defense.toFormattedNumber()}`}</span>
    </div>
  );
}

function FightStatBar({barClassName, current, label, max}) {
  return (
    <div
      aria-label={label}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={current}
      className={barClassName}
      role="progressbar"
      style={{width: '100%'}}
    >
      <div className={css.fill} style={{width: `${Math.round((current / max) * 100)}%`}} />
    </div>
  );
}

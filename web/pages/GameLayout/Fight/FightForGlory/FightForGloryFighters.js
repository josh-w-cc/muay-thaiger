import classnames from 'classnames';

import SnowLeopardMuayThaiReady from '../assets/SnowLeopardMuayThaiReady.png';
import TigerMuayThai from '../assets/TigerMuayThai.png';

import {
  FIGHT_FOR_GLORY_FIGHTER_ATTACK,
  FIGHT_FOR_GLORY_FIGHTER_DEFENSE,
  FIGHT_FOR_GLORY_FIGHTER_HP,
  FIGHT_FOR_GLORY_FIGHTER_STAMINA,
  FIGHT_FOR_GLORY_OPPONENT_ATTACK,
  FIGHT_FOR_GLORY_OPPONENT_DEFENSE,
  FIGHT_FOR_GLORY_OPPONENT_HP,
  FIGHT_FOR_GLORY_OPPONENT_STAMINA,
} from './fightForGloryData.js';
import css from '../Fight.module.css';

const tigerCard = {
  alt: 'Tiger Muay Thai fighter', attack: FIGHT_FOR_GLORY_FIGHTER_ATTACK,
  className: css.gloryFighterLeft, defense: FIGHT_FOR_GLORY_FIGHTER_DEFENSE,
  hp: FIGHT_FOR_GLORY_FIGHTER_HP, src: TigerMuayThai, stamina: FIGHT_FOR_GLORY_FIGHTER_STAMINA,
};
const opponentCard = {
  alt: 'Snow leopard Muay Thai fighter', attack: FIGHT_FOR_GLORY_OPPONENT_ATTACK,
  className: css.gloryFighterRight, defense: FIGHT_FOR_GLORY_OPPONENT_DEFENSE,
  hp: FIGHT_FOR_GLORY_OPPONENT_HP, mirror: true, src: SnowLeopardMuayThaiReady,
  stamina: FIGHT_FOR_GLORY_OPPONENT_STAMINA,
};

export default function FightForGloryFighters() {
  return (
    <>
      <div className={css.gloryFighters}>
        <FightForGloryFighterCard {...tigerCard} />
        <div aria-orientation="vertical" className={css.gloryFighterDivider} role="separator" />
        <FightForGloryFighterCard {...opponentCard} />
      </div>
      <div className={css.gloryFighterStatsRow}>
        <FightForGloryFighterStats attack={tigerCard.attack} defense={tigerCard.defense} />
        <div aria-hidden className={css.gloryFighterStatsDividerSpacer} />
        <FightForGloryFighterStats attack={opponentCard.attack} defense={opponentCard.defense} />
      </div>
    </>
  );
}

function FightForGloryFighterCard({alt, className, hp, mirror, src, stamina}) {
  return (
    <div className={classnames(css.gloryFighter, className)}>
      <FightForGloryStaminaBar current={stamina.current} label={stamina.label} max={stamina.max} />
      <img
        alt={alt}
        className={classnames(css.gloryFighterImage, {[css.gloryFighterImageMirror]: mirror})}
        src={src}
      />
      <FightForGloryHealthBar current={hp.current} label={hp.label} max={hp.max} />
    </div>
  );
}

function FightForGloryFighterStats({attack, defense}) {
  return (
    <div className={css.gloryFighterStats}>
      <span>{`A: ${attack}`}</span>
      <span>{`D: ${defense}`}</span>
    </div>
  );
}

function FightForGloryHealthBar({current, label, max}) {
  return (
    <div
      aria-label={label}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={current}
      className={css.gloryHealthBar}
      role="progressbar"
    >
      <div className={css.gloryHealthBarFill} style={{width: `${Math.round((current / max) * 100)}%`}} />
    </div>
  );
}

function FightForGloryStaminaBar({current, label, max}) {
  return (
    <div
      aria-label={label}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={current}
      className={css.gloryStaminaBar}
      role="progressbar"
    >
      <div className={css.gloryStaminaBarFill} style={{width: `${Math.round((current / max) * 100)}%`}} />
    </div>
  );
}

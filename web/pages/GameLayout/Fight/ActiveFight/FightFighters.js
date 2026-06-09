import classnames from 'classnames';
import {buildCard, formatCombatStat} from './fighterCardData.js';

import css from '../Fight.module.css';

export default function FightFighters({details, isPunching}) {
  const {attackerCard, defenderCard} = getFighterCards(details);

  return (
    <>
      <div className={css.fightFighters}>
        <FightFighterCard {...attackerCard} isPunching={isPunching} />
        <div aria-orientation="vertical" className={css.fightFighterDivider} role="separator" />
        <FightFighterCard {...defenderCard} />
      </div>
      <div className={css.fightFighterStatsRow}>
        <FightFighterStats attack={attackerCard.attack} defense={attackerCard.defense} />
        <div aria-hidden className={css.fightFighterStatsDividerSpacer} />
        <FightFighterStats attack={defenderCard.attack} defense={defenderCard.defense} />
      </div>
    </>
  );
}

function getFighterCards(details) {
  return {
    attackerCard: {
      ...buildCard(details?.attacker),
      className: css.fightFighterLeft,
    },
    defenderCard: {
      ...buildCard(details?.defender),
      className: css.fightFighterRight,
      mirror: true,
    },
  };
}

function FightFighterCard({alt, className, hp, isPunching, mirror, punchSrc, src, stamina}) {
  return (
    <div className={classnames(css.fightFighter, className)}>
      <FightStatBar barClassName={css.fightStaminaBar} current={stamina.current} label={stamina.label} max={stamina.max} />
      <FightFighterImages alt={alt} isPunching={isPunching} mirror={mirror} punchSrc={punchSrc} src={src} />
      <FightStatBar barClassName={css.fightHealthBar} current={hp.current} label={hp.label} max={hp.max} />
    </div>
  );
}

function FightFighterImages({alt, isPunching, mirror, punchSrc, src}) {
  const showPunch = isPunching && Boolean(punchSrc);
  return (
    <div className={css.fightFighterImageContainer}>
      <img
        alt={alt}
        aria-hidden={showPunch ? true : undefined}
        className={classnames(css.fightFighterImage, {[css.fightFighterImageMirror]: mirror})}
        src={src}
      />
      {showPunch && (
        <img
          alt={alt}
          className={classnames(css.fightFighterImagePunch, {[css.fightFighterImagePunchMirror]: mirror})}
          src={punchSrc}
        />
      )}
    </div>
  );
}

function FightFighterStats({attack, defense}) {
  return (
    <div className={css.fightFighterStats}>
      <span>{`A: ${formatCombatStat(attack)}`}</span>
      <span>{`D: ${formatCombatStat(defense)}`}</span>
    </div>
  );
}

function FightStatBar({barClassName, current, label, max}) {
  const width = (current * 100n) / max;

  return (
    <div
      aria-label={label}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={current}
      className={barClassName}
      role="progressbar"
    >
      <div className={css.fill} style={{width: `${width}%`}} />
    </div>
  );
}

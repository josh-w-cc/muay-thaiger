import classnames from 'classnames';

import Button from '@/components/Button.js';
import Section from '@/components/primitive/Section.js';
import SnowLeopardMuayThaiReady from './assets/SnowLeopardMuayThaiReady.png';
import TigerMuayThai from './assets/TigerMuayThai.png';

import {FIGHT_FOR_GLORY_FEED} from './FightForGloryFeedData.js';
import css from './Fight.module.css';

const FIGHT_FOR_GLORY_FIGHTER_HP = {current: 170, max: 200};
const FIGHT_FOR_GLORY_LOADOUT = {moves: ['Jab', 'Roundhouse', 'Elbow', 'Knee'], strategy: 'Pressure Counter'};
const FIGHT_FOR_GLORY_OPPONENT_HP = {current: 143, max: 200};

function FightForGlory() {
  return (
    <Section className={css.glorySection}>
      <h2>Fight for Glory</h2>
      <FightForGloryLoadout />
      <FightForGloryFighters />
      <FightForGloryFeed />
    </Section>
  );
}

export default FightForGlory;

function FightForGloryFeed() {
  return (
    <div className={css.gloryFeed}>
      <ul className={css.gloryFeedList}>
        {FIGHT_FOR_GLORY_FEED.map((item, index) => <FightForGloryFeedItem item={item} key={index} />)}
      </ul>
    </div>
  );
}

function FightForGloryFeedItem({item}) {
  const attackerClassName = item.isSelf ? css.gloryFeedAttackerSelf : css.gloryFeedAttackerEnemy;

  return (
    <li className={css.gloryFeedItem}>
      <strong className={attackerClassName}>{item.attacker}</strong>
      {' throws '}
      <strong>{item.move}</strong>
      {' — '}
      {item.result}
    </li>
  );
}

function FightForGloryFighters() {
  const tigerFighterCard = {
    alt: 'Tiger Muay Thai fighter', className: css.gloryFighterLeft,
    hp: FIGHT_FOR_GLORY_FIGHTER_HP, label: 'Tiger fighter health', src: TigerMuayThai,
  };
  const snowLeopardFighterCard = {
    alt: 'Snow leopard Muay Thai fighter', className: css.gloryFighterRight,
    hp: FIGHT_FOR_GLORY_OPPONENT_HP, label: 'Snow leopard fighter health', mirror: true, src: SnowLeopardMuayThaiReady,
  };
  return (
    <div className={css.gloryFighters}>
      <FightForGloryFighterCard {...tigerFighterCard} />
      <div aria-orientation="vertical" className={css.gloryFighterDivider} role="separator" />
      <FightForGloryFighterCard {...snowLeopardFighterCard} />
    </div>
  );
}

function FightForGloryFighterCard({alt, className, hp, label, mirror, src}) {
  return (
    <div className={classnames(css.gloryFighter, className)}>
      <img
        alt={alt}
        className={classnames(css.gloryFighterImage, {[css.gloryFighterImageMirror]: mirror})}
        src={src}
      />
      <FightForGloryHealthBar current={hp.current} label={label} max={hp.max} />
    </div>
  );
}

function FightForGloryHealthBar({current, label, max}) {
  const widthPercentage = max > 0
    ? Math.max(0, Math.min(100, Math.round((current / max) * 100)))
    : 0;

  return (
    <div
      aria-label={label}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={current}
      className={css.gloryHealthBar}
      role="progressbar"
    >
      <div className={css.gloryHealthBarFill} style={{width: `${widthPercentage}%`}} />
    </div>
  );
}

function FightForGloryLoadout() {
  return (
    <div className={css.gloryLoadout}>
      <div className={css.gloryLoadoutButtons}>
        {[`Strategy: ${FIGHT_FOR_GLORY_LOADOUT.strategy}`, ...FIGHT_FOR_GLORY_LOADOUT.moves].map((item) => (
          <Button className={css.tapperButton} key={item}>{item}</Button>
        ))}
      </div>
    </div>
  );
}

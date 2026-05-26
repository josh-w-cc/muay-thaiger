import classnames from 'classnames';

import SnowLeopardMuayThaiReady from './assets/SnowLeopardMuayThaiReady.png';
import TigerMuayThai from './assets/TigerMuayThai.png';

import css from './Fight.module.css';


const FIGHT_FOR_GLORY_FEED = [
  {move: 'Jab', result: 'Lands for 18 damage!'},
  {move: 'Roundhouse', result: 'Misses clean.'},
  {move: 'Elbow', result: 'Lands for 24 damage!'},
  {move: 'Knee', result: 'Lands for 15 damage!'},
];

const FIGHT_FOR_GLORY_FIGHTER_HP = {current: 170, max: 200};
const FIGHT_FOR_GLORY_LOADOUT = {moves: ['Jab', 'Roundhouse', 'Elbow', 'Knee'], strategy: 'Pressure Counter'};
const FIGHT_FOR_GLORY_OPPONENT_HP = {current: 143, max: 200};

function FightForGlory() {
  return (
    <section className={css.glorySection}>
      <h2>Fight for Glory</h2>
      <FightForGloryLoadout />
      <FightForGloryFighters />
      <FightForGloryFeed />
    </section>
  );
}

export default FightForGlory;

function FightForGloryFeed() {
  return (
    <div className={css.gloryFeed}>
      <h3>Completed Moves</h3>
      <ul>{FIGHT_FOR_GLORY_FEED.map((item) => <FightForGloryFeedItem item={item} key={item.move} />)}</ul>
    </div>
  );
}

function FightForGloryFeedItem({item}) {
  return (
    <li>
      <strong>{item.move}</strong>
      :
      {' '}
      {item.result}
    </li>
  );
}

function FightForGloryFighters() {
  return (
    <div className={css.gloryFighters}>
      <FightForGloryFighterCard
        alt="Tiger Muay Thai fighter"
        hp={FIGHT_FOR_GLORY_FIGHTER_HP}
        label="Tiger fighter health"
        src={TigerMuayThai}
      />
      <FightForGloryFighterCard
        alt="Snow leopard Muay Thai fighter"
        hp={FIGHT_FOR_GLORY_OPPONENT_HP}
        label="Snow leopard fighter health"
        mirror
        src={SnowLeopardMuayThaiReady}
      />
    </div>
  );
}

function FightForGloryFighterCard({alt, hp, label, mirror, src}) {
  return (
    <div className={css.gloryFighter}>
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

function FightForGloryLoadout() {
  return (
    <div className={css.gloryLoadout}>
      <h3>Loadout</h3>
      <div>
        Strategy:
        {' '}
        {FIGHT_FOR_GLORY_LOADOUT.strategy}
      </div>
      <ul>{FIGHT_FOR_GLORY_LOADOUT.moves.map((move) => <li key={move}>{move}</li>)}</ul>
    </div>
  );
}

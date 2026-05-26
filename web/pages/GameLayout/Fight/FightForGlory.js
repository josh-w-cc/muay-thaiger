import classnames from 'classnames';

import Button from '@/components/Button.js';
import SnowLeopardMuayThaiReady from './assets/SnowLeopardMuayThaiReady.png';
import TigerMuayThai from './assets/TigerMuayThai.png';

import css from './Fight.module.css';


const FIGHT_FOR_GLORY_FEED = [
  {move: 'Jab', result: 'Lands for 18 damage!'},
  {move: 'Roundhouse', result: 'Misses clean.'},
  {move: 'Elbow', result: 'Lands for 24 damage!'},
  {move: 'Knee', result: 'Lands for 15 damage!'},
];

const FIGHT_FOR_GLORY_LOADOUT = {moves: ['Jab', 'Roundhouse', 'Elbow', 'Knee'], strategy: 'Pressure Counter'};

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
      <img alt="Tiger Muay Thai fighter" className={css.gloryFighterImage} src={TigerMuayThai} />
      <img
        alt="Snow leopard Muay Thai fighter"
        className={classnames(css.gloryFighterImage, css.gloryFighterImageMirror)}
        src={SnowLeopardMuayThaiReady}
      />
    </div>
  );
}

function FightForGloryLoadout() {
  const loadoutItems = [
    `Strategy: ${FIGHT_FOR_GLORY_LOADOUT.strategy}`,
    ...FIGHT_FOR_GLORY_LOADOUT.moves,
  ];

  return (
    <div className={css.gloryLoadout}>
      <div className={css.gloryLoadoutButtons}>
        {loadoutItems.map((item) => (
          <Button className={css.gloryLoadoutButton} key={item}>{item}</Button>
        ))}
      </div>
    </div>
  );
}

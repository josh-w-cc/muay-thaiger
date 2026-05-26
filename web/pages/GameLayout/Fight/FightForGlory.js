import classnames from 'classnames';

import Button from '@/components/Button.js';
import Section from '@/components/primitive/Section.js';
import SnowLeopardMuayThaiReady from './assets/SnowLeopardMuayThaiReady.png';
import TigerMuayThai from './assets/TigerMuayThai.png';

import css from './Fight.module.css';


const FIGHT_FOR_GLORY_FEED = [
  {attacker: 'Tiger', move: 'Jab', result: 'Lands for 18 damage!'},
  {attacker: 'Snow Leopard', move: 'Roundhouse', result: 'Misses clean.'},
  {attacker: 'Tiger', move: 'Elbow', result: 'Lands for 24 damage!'},
  {attacker: 'Snow Leopard', move: 'Knee', result: 'Lands for 15 damage!'},
  {attacker: 'Tiger', move: 'Teep', result: 'Pushes back for 8 damage.'},
  {attacker: 'Snow Leopard', move: 'Left Hook', result: 'Blocked!'},
  {attacker: 'Tiger', move: 'Flying Knee', result: 'Lands for 31 damage!'},
  {attacker: 'Snow Leopard', move: 'Body Kick', result: 'Grazes for 7 damage.'},
  {attacker: 'Tiger', move: 'Uppercut', result: 'Misses wide.'},
  {attacker: 'Snow Leopard', move: 'Spinning Elbow', result: 'Lands for 29 damage!'},
  {attacker: 'Tiger', move: 'Clinch Knee', result: 'Lands for 22 damage!'},
  {attacker: 'Snow Leopard', move: 'Low Kick', result: 'Buckles the knee for 11 damage.'},
];

const FIGHT_FOR_GLORY_LOADOUT = {moves: ['Jab', 'Roundhouse', 'Elbow', 'Knee'], strategy: 'Pressure Counter'};

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
      <h3>Completed Moves</h3>
      <ul className={css.gloryFeedList}>
        {FIGHT_FOR_GLORY_FEED.map((item, index) => <FightForGloryFeedItem item={item} key={index} />)}
      </ul>
    </div>
  );
}

function FightForGloryFeedItem({item}) {
  return (
    <li>
      <strong>{item.attacker}</strong>
      {' throws '}
      <strong>{item.move}</strong>
      {' — '}
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
      <h3>Loadout</h3>
      <div className={css.gloryLoadoutButtons}>
        {loadoutItems.map((item) => (
          <Button className={css.gloryLoadoutButton} key={item}>{item}</Button>
        ))}
      </div>
    </div>
  );
}

import {FIGHT_FEED} from './FightFeedData.js';
import css from '../Fight.module.css';


export default function FightFeed() {
  return (
    <div className={css.fightFeed}>
      <ul className={css.fightFeedList}>
        {FIGHT_FEED.map((item, index) => <FightFeedItem item={item} key={index} />)}
      </ul>
    </div>
  );
}

function FightFeedItem({item}) {
  const attackerClassName = item.isSelf ? css.fightFeedAttackerSelf : css.fightFeedAttackerEnemy;

  return (
    <li className={css.fightFeedItem}>
      <strong className={attackerClassName}>{item.attacker}</strong>
      {' throws '}
      <strong>{item.move}</strong>
      {' — '}
      {item.result}
    </li>
  );
}

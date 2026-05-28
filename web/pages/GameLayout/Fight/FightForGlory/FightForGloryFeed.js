import {FIGHT_FOR_GLORY_FEED} from './FightForGloryFeedData.js';
import css from '../Fight.module.css';


export default function FightForGloryFeed() {
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

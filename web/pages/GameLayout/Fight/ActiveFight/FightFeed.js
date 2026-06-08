import cx from 'classnames';

import css from '../Fight.module.css';


export default function FightFeed({details}) {
  const feedItems = getFightFeed(details);

  return (
    <div className={css.fightFeed}>
      <ul className={css.fightFeedList}>
        {feedItems.map((item, index) => <FightFeedItem item={item} key={index} />)}
      </ul>
    </div>
  );
}

function FightFeedItem({item}) {
  return (
    <li className={css.fightFeedItem}>
      <strong className={cx({
        [css.fightFeedAttackerEnemy]: !item.isSelf,
        [css.fightFeedAttackerSelf]: item.isSelf,
      })}
      >
        {item.attacker}
      </strong>
      {' throws '}
      <strong>{item.move}</strong>
      {' — '}
      {item.result}
    </li>
  );
}

function getFightFeed(details) {
  if(Array.isArray(details?.feed) && details.feed.length > 0) {
    return [...details.feed].reverse();
  }
  return [];
}

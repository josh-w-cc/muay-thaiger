import useFightStore from '@/data/fight.js';
import css from '../Fight.module.css';


export default function FightFeed({details}) {
  const pendingFeed = useFightStore((state) => state.pendingFeed);
  const feedItems = getFightFeed(details, pendingFeed);

  return (
    <div className={css.fightFeed}>
      <ul className={css.fightFeedList}>
        {feedItems.map((item) => <FightFeedItem item={item} key={item.feedKey} />)}
      </ul>
    </div>
  );
}

function FightFeedItem({item}) {
  const attackerClassName = item.isSelf ? css.fightFeedAttackerSelf : css.fightFeedAttackerEnemy;

  return (
    <li className={`${css.fightFeedItem} ${css.fightFeedItemEnter}`}>
      <strong className={attackerClassName}>{item.attacker}</strong>
      {' throws '}
      <strong>{item.move}</strong>
      {item.result != null && (
        <>
          {' — '}
          {item.result}
        </>
      )}
    </li>
  );
}

function reverseFeed(feed, source) {
  return Array.isArray(feed) && feed.length > 0
    ? feed.map((item, index) => ({...item, feedKey: `${source}-${index}`})).reverse()
    : [];
}

function getFightFeed(details, pendingFeed) {
  return [...reverseFeed(pendingFeed, 'pending'), ...reverseFeed(details?.feed, 'server')];
}

import useFightStore from '@/data/fight/index.js';
import css from '../Fight.module.css';


export default function FightFeed({details}) {
  const pendingFeed = useFightStore((state) => state.pendingFeed);
  const feedItems = getFightFeed(details, pendingFeed);

  return (
    <div className={css.fightFeed}>
      <ul className={css.fightFeedList}>
        {feedItems.map(({feedKey, item, shouldAnimate}) => <FightFeedItem item={item} key={feedKey} shouldAnimate={shouldAnimate} />)}
      </ul>
    </div>
  );
}

function FightFeedItem({item, shouldAnimate}) {
  const attackerClassName = item.isSelf ? css.fightFeedAttackerSelf : css.fightFeedAttackerEnemy;
  const itemClassName = shouldAnimate ? `${css.fightFeedItem} ${css.fightFeedItemEnter}` : css.fightFeedItem;

  return (
    <li className={itemClassName}>
      <strong className={attackerClassName}>{item.attacker}</strong>
      {' throws '}
      <strong>{item.move}</strong>
      {item.result != null && (
        <>
          <br />
          {' — '}
          {item.result}
        </>
      )}
    </li>
  );
}

function reverseFeed(feed, source) {
  return Array.isArray(feed) && feed.length > 0
    ? feed.map((item, index) => ({
        feedKey: `${source}-${index}`,
        item,
        shouldAnimate: source === 'pending' || source === 'server',
      })).reverse()
    : [];
}

function getFightFeed(details, pendingFeed) {
  return [...reverseFeed(pendingFeed, 'pending'), ...reverseFeed(details?.feed, 'server')];
}

import useFightStore from '@/data/fight.js';
import css from '../Fight.module.css';


export default function FightFeed({details}) {
  const pendingFeed = useFightStore((state) => state.pendingFeed);
  const feedItems = getFightFeed(details, pendingFeed);

  return (
    <div className={css.fightFeed}>
      <ul className={css.fightFeedList}>
        {feedItems.map((item, index) => <FightFeedItem item={item} key={index} />)}
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
      {item.result != null && (
        <>
          {' — '}
          {item.result}
        </>
      )}
    </li>
  );
}

function getFightFeed(details, pendingFeed) {
  const serverItems = Array.isArray(details?.feed) && details.feed.length > 0
    ? [...details.feed].reverse()
    : [];
  const pendingItems = Array.isArray(pendingFeed) && pendingFeed.length > 0
    ? [...pendingFeed].reverse()
    : [];
  return [...pendingItems, ...serverItems];
}

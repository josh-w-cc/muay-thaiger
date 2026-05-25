import useFighterStore from '@/data/fighter.js';
import {formatGold} from '@/utils/gold.js';

import css from './GoldDisplay.module.css';


export default function GoldDisplay() {
  const fighter = useFighterStore();
  const gold = formatGold(fighter.gold);

  return (
    <div className={css.goldDisplay}>
      <span className={css.symbol}>฿</span>
      <span className={css.amount}>{gold}</span>
    </div>
  );
}

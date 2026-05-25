import useFighterStore from '@/data/fighter.js';
import formatHugeNumber from '@/utils/formatHugeNumber.js';

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

function formatGold(gold) {
  const baht = gold / 100;

  if(baht < 10000) {
    return baht.toFixed(2);
  }

  return formatHugeNumber(Math.floor(baht));
}

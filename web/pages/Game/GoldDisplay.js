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
  const baht = gold / 100n;
  const satang = gold % 100n;

  if(baht < 10000n) {
    return `${baht}.${satang.toString().padStart(2, '0')}`;
  }

  return formatHugeNumber(baht);
}

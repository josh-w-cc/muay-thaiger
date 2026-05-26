import useFighterStore from '@/data/fighter.js';

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
  const cents = gold % 100n;

  if(baht < 10000n) {
    return `${baht}.${String(Number(cents)).padStart(2, '0')}`;
  }

  return baht.toFormattedNumber();
}

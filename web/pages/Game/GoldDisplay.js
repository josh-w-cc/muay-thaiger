import useFighterStore from '@/data/fighter.js';
import formatHugeNumber from '@/utils/formatHugeNumber.js';
import {parseWholeBigInt} from 'shared/fighter-stats.js';

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
  const satang = parseWholeBigInt(gold) ?? 0n;
  const baht = satang / 100n;

  if(baht < 10000n) {
    return `${baht}.${(satang % 100n).toString().padStart(2, '0')}`;
  }

  return formatHugeNumber(baht);
}

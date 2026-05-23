import {Outlet, redirect} from 'react-router-dom';

import {loadPlayerToken} from '@/actions/websockets/token.js';
import useFighterStore from '@/data/fighter.js';
import formatHugeNumber from '@/utils/formatHugeNumber.js';
import Header from './Header.js';
import css from './GameLayout.module.css';


export function GameLayout() {
  const fighter = useFighterStore();

  return (
    <div className={css.layout}>
      <div className={css.baht}>฿ {formatBaht({gold: fighter.gold})}</div>
      <Header />
      <Outlet />
    </div>
  );
}

export async function loader() {
  if(!loadPlayerToken()) {
    return redirect('/');
  }
  return null;
}

function formatBaht({gold}) {
  const baht = gold / 100;
  if(Number.isInteger(baht)) {
    return formatHugeNumber(baht);
  }

  return baht.toFixed(2).replace(/\.?0+$/, '');
}

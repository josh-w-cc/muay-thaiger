import {Outlet, redirect} from 'react-router-dom';

import {loadPlayerToken} from '@/actions/websockets/state/token.js';
import loadMoves from '@/data/movesLoader.js';
import Header from './Header.js';

import css from './GameLayout.module.css';


export function GameLayout() {
  return (
    <>
      <Header />
      <div className={css.page}>
        <Outlet />
      </div>
    </>
  );
}

export async function loader() {
  if(!loadPlayerToken()) {
    return redirect('/');
  }
  await loadMoves();
  return null;
}

import {Outlet, redirect} from 'react-router-dom';

import {loadPlayerToken} from '@/actions/websockets/auth.js';
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
  return null;
}

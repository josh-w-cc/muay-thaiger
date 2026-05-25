import {Outlet, redirect} from 'react-router-dom';

import {loadPlayerToken} from '@/actions/websockets/token.js';
import GoldDisplay from './GoldDisplay.js';
import Header from './Header.js';
import UserMenuButton from './UserMenuButton.js';

import css from './GameLayout.module.css';


export function GameLayout() {
  return (
    <>
      <div className={css.headerLayout}>
        <div className={css.headerControls}>
          <GoldDisplay />
          <UserMenuButton />
        </div>
        <Header />
      </div>
      <Outlet />
    </>
  );
}

export async function loader() {
  if(!loadPlayerToken()) {
    return redirect('/');
  }
  return null;
}

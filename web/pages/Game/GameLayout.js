import {Outlet, redirect} from 'react-router-dom';

import {loadPlayerToken} from '@/actions/websockets/token.js';
import GoldDisplay from './GoldDisplay.js';
import Header from './Header.js';
import UserMenuButton from './UserMenuButton.js';


export function GameLayout() {
  return (
    <>
      <GoldDisplay />
      <UserMenuButton />
      <Header />
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

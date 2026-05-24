import {Outlet, redirect} from 'react-router-dom';

import {loadPlayerToken} from '@/actions/websockets/token.js';
import GoldDisplay from './GoldDisplay.js';
import Header from './Header.js';


export function GameLayout() {
  return (
    <>
      <GoldDisplay />
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

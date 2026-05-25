import {Outlet, redirect} from 'react-router-dom';

import {loadPlayerToken} from '@/actions/websockets/token.js';
import Header from './Header.js';


export function GameLayout() {
  return (
    <>
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

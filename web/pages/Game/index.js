import {Outlet, redirect, useLoaderData, useNavigate} from 'react-router-dom';

import {loadPlayerToken} from '@/data/player.js';
import {fetchJSON} from '@/utils/fetchAPI.js';
import CharacterSelect from './CharacterSelect';
import Fight from './Fight';
import Header from './Header.js';
import Hub from './Hub.js';
import Shop from './Shop';
import Train from './Train';
import useAuthSocket from './useAuthSocket.js';
import './Game.css';
import '../../orig/src/index.css';

export default function Game() {
  const races = useLoaderData() ?? [];
  const onCharacterSelectExit = useAuthSocket();
  return (
    <CharacterSelect onExit={onCharacterSelectExit} races={races} />
  );
}

export function FallbackScreen() {
  const navigate = useNavigate();

  return (
    <>
      <h1>You broke it!?</h1>
      <button onClick={() => navigate('/hub')}>We have to go back</button>
    </>
  );
}

export function FightScreen() {
  return <Fight />;
}

export function GameLayout() {
  useAuthSocket();

  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}

export function HubScreen() {
  return <Hub />;
}

export function ShopScreen() {
  return <Shop />;
}

export function TrainScreen() {
  return <Train />;
}

export async function characterSelectLoader() {
  if(hasPlayerToken()) {
    return redirect('/hub');
  }
  return loadRaces();
}

export async function gameScreenLoader() {
  if(!hasPlayerToken()) {
    return redirect('/');
  }
  return null;
}

function hasPlayerToken() {
  return !!loadPlayerToken();
}

async function loadRaces() {
  try {
    return await fetchJSON('race');
  }
  catch(error) {
    console.error('Failed to load races', error);
    return [];
  }
}

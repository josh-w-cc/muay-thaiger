import {Outlet, redirect, useLoaderData, useNavigate} from 'react-router';

import {loadPlayerToken} from '@/data/player.js';
import {fetchJSON} from '@/utils/fetchAPI.js';
import CharacterSelect from '../../orig/src/menus/CharacterSelect';
import Fight from '../../orig/src/menus/Fight';
import Header from './Header.js';
import Hub from './Hub.js';
import Shop from '../../orig/src/menus/Shop';
import Train from '../../orig/src/menus/Train';
import useAuthSocket from './useAuthSocket.js';
import './Game.css';
import '../../orig/src/index.css';
const CHARACTER_SELECT_SCREEN = 'character-select';

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

export async function loader({params, request} = {}) {
  const screen = resolveScreen({params, request});
  if(isGameScreen(screen)) {
    return gameScreenLoader();
  }
  return characterSelectLoader();
}

function getScreenFromRequest(request) {
  if(!request?.url) {
    return null;
  }
  const {pathname} = new URL(request.url);
  const screen = pathname.slice(1);
  if(!screen) {
    return null;
  }
  return screen;
}

function isGameScreen(screen) {
  return !!screen && screen !== CHARACTER_SELECT_SCREEN;
}

function hasPlayerToken() {
  return !!loadPlayerToken();
}

function resolveScreen({params, request}) {
  return params?.screen ?? getScreenFromRequest(request);
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

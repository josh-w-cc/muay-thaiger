import {redirect, useLoaderData, useNavigate} from 'react-router-dom';

import {loadPlayerToken} from '@/data/player.js';
import {fetchJSON} from '@/utils/fetchAPI.js';
import FighterSelect from './FighterSelect';
import Fight from './Fight';
import Hub from './Hub.js';
import Shop from './Shop';
import Train from './Train';
import './Game.css';

export default function Game() {
  const races = useLoaderData() ?? [];
  return (
    <FighterSelect races={races} />
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

export function HubScreen() {
  return <Hub />;
}

export function ShopScreen() {
  return <Shop />;
}

export function TrainScreen() {
  return <Train />;
}

export async function fighterSelectLoader() {
  if(hasPlayerToken()) {
    return redirect('/hub');
  }
  return loadRaces();
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

import {redirect, useLoaderData} from 'react-router-dom';

import {loadPlayerToken} from '@/actions/websockets/token.js';
import {fetchJSON} from '@/utils/fetchAPI.js';
import FighterSelect from '../FighterSelect';
import './Game.css';

export default function Game() {
  const races = useLoaderData() ?? [];
  return (
    <FighterSelect races={races} />
  );
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

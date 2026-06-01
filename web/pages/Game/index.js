import {redirect} from 'react-router-dom';

import {loadPlayerToken} from '@/actions/websockets/auth.js';
import useRacesStore from '@/data/races.js';
import {fetchJSON} from '@/utils/fetchAPI.js';
import FighterSelect from '../FighterSelect';
import './Game.css';

export default function Game() {
  return <FighterSelect />;
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
  const {setRaces} = useRacesStore.getState();

  try {
    const races = await fetchJSON('race');
    setRaces(races);
    return races;
  }
  catch(error) {
    console.error('Failed to load races', error);
    setRaces([]);
    return [];
  }
}

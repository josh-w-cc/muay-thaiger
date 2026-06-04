import {redirect} from 'react-router-dom';
import {useEffect, useState} from 'react';

import {getHasConnectionError} from '@/actions/websockets/index.js';
import {loadPlayerToken} from '@/actions/websockets/state/token.js';
import useRacesStore from '@/data/races.js';
import {fetchJSON} from '@/utils/fetchAPI.js';
import FighterSelect from '../FighterSelect';
import './Game.css';

export default function Game() {
  const [hasConnectionError, setHasConnectionError] = useState(getHasConnectionError);

  useEffect(() => {
    const onConnectionError = ({detail}) => setHasConnectionError(detail);
    window.addEventListener('websocket-connection-error', onConnectionError);
    return () => {
      window.removeEventListener('websocket-connection-error', onConnectionError);
    };
  }, []);

  if(hasConnectionError) {
    return <p role="alert">Failed to connect to server.</p>;
  }

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

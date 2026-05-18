import {useLoaderData, useNavigate, useParams} from 'react-router';

import {fetchJSON} from '@/utils/fetchAPI.js';
import CharacterSelect from '../../orig/src/menus/CharacterSelect';
import Fight from '../../orig/src/menus/Fight';
import Header from './Header.js';
import Hub from '../../orig/src/menus/Hub.js';
import Shop from '../../orig/src/menus/Shop';
import Train from '../../orig/src/menus/Train';
import useAuthSocket from './useAuthSocket.js';

import './Game.css';
import '../../orig/src/index.css';

export async function loader({params}) {
  if(getScreen(params) !== 'character-select') {
    return null;
  }
  return fetchJSON('race');
}

export default function Game() {
  const raceStatics = useRaceStatics();
  const navigate = useNavigate();
  const {screen = 'character-select'} = useParams();
  const setScreen = generateSetScreenFn(navigate);
  const onCharacterSelectExit = useAuthSocket(setScreen);

  if(screen === 'character-select') {
    return <CharacterSelect onExit={onCharacterSelectExit} raceStatics={raceStatics} />;
  }

  return (
    <>
      <Header setScreen={setScreen} />
      {renderScreen(screen, setScreen)}
    </>
  );
}

function getScreen(params = {}) {
  return params.screen ?? 'character-select';
}

function useRaceStatics() {
  try {
    return useLoaderData() ?? [];
  }
  catch{
    return [];
  }
}

function generateSetScreenFn(navigate) {
  return (screen) => {
    if(screen === 'character-select') {
      navigate('/');
      return;
    }
    navigate(`/${screen}`);
  };
}

function getFallback(setScreen) {
  return (
    <>
      <h1>You broke it!?</h1>
      <button onClick={() => setScreen('hub')}>We have to go back</button>
    </>
  );
}

function renderScreen(screen, setScreen) {
  switch(screen) {
    case 'hub':
      return <Hub setScreen={setScreen} />;
    case 'fight':
      return <Fight />;
    case 'shop':
      return <Shop />;
    case 'train':
      return <Train />;
    default:
      return getFallback(setScreen);
  }
}

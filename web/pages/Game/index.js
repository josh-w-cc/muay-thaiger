import {redirect, useLoaderData, useNavigate, useParams} from 'react-router';
import {fetchJSON} from '@/utils/fetchAPI.js';
import CharacterSelect from '../../orig/src/menus/CharacterSelect';
import Fight from '../../orig/src/menus/Fight';
import Header from './Header.js';
import Hub from './Hub.js';
import Shop from '../../orig/src/menus/Shop';
import Train from '../../orig/src/menus/Train';
import useAuthSocket, {PLAYER_TOKEN_STORAGE_KEY} from './useAuthSocket.js';
import './Game.css';
import '../../orig/src/index.css';
const CHARACTER_SELECT_SCREEN = 'character-select';
export async function loader({params}) {
  const screen = params?.screen;
  const preLoadResponse = getPreLoadResponse(screen);
  if(preLoadResponse !== undefined) {
    return preLoadResponse;
  }
  return loadRaceStatics();
}
function getPreLoadResponse(screen) {
  if(shouldRedirectToHub(screen)) {
    return redirect('/hub');
  }
  if(shouldRedirectToCharacterSelect(screen)) {
    return redirect('/');
  }
  if((screen ?? CHARACTER_SELECT_SCREEN) !== CHARACTER_SELECT_SCREEN) {
    return null;
  }
  return undefined;
}
async function loadRaceStatics() {
  try {
    return await fetchJSON('race');
  }
  catch(error) {
    console.error('Failed to load race statics', error);
    return [];
  }
}
export default function Game() {
  const raceStatics = useLoaderData() ?? [];
  const navigate = useNavigate();
  const {screen = CHARACTER_SELECT_SCREEN} = useParams();
  const setScreen = generateSetScreenFn(navigate);
  const onCharacterSelectExit = useAuthSocket({
    isCharacterSelectScreen: screen === CHARACTER_SELECT_SCREEN,
    setScreen,
  });
  if(screen === CHARACTER_SELECT_SCREEN) {
    return <CharacterSelect onExit={onCharacterSelectExit} raceStatics={raceStatics} />;
  }
  return (
    <>
      <Header setScreen={setScreen} />
      {renderScreen(screen, setScreen)}
    </>
  );
}
function generateSetScreenFn(navigate) {
  return (screen) => {
    if(screen === CHARACTER_SELECT_SCREEN) {
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
function shouldRedirectToCharacterSelect(screen) {
  return screen && screen !== CHARACTER_SELECT_SCREEN && !getPlayerToken();
}
function shouldRedirectToHub(screen) {
  return !screen && !!getPlayerToken();
}
function getPlayerToken() {
  if(typeof localStorage === 'undefined') {
    return null;
  }
  return localStorage.getItem(PLAYER_TOKEN_STORAGE_KEY);
}

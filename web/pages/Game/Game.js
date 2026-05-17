import {useNavigate, useParams} from 'react-router';

import CharacterSelect from '../../orig/src/menus/CharacterSelect';
import Fight from '../../orig/src/menus/Fight';
import Header from '../../orig/src/menus/Header.jsx';
import Hub from '../../orig/src/menus/Hub.jsx';
import Shop from '../../orig/src/menus/Shop';
import Train from '../../orig/src/menus/Train';

import './Game.css';


export default function Game() {
  const navigate = useNavigate();
  const {screen = 'character-select'} = useParams();
  const setScreen = generateSetScreenFn(navigate);
  if(screen === 'character-select') {
    return <CharacterSelect onExit={() => setScreen('hub')} />;
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

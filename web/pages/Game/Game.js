import React from 'react';

import CharacterSelect from '../../orig/src/menus/CharacterSelect';
import Fight from '../../orig/src/menus/Fight';
import Header from './Header.js';
import Hub from '../../orig/src/menus/Hub.jsx';
import Shop from '../../orig/src/menus/Shop';
import Train from '../../orig/src/menus/Train';

import './Game.css';


export default function Game() {
  const [screen, setScreen] = React.useState('character-select');

  React.useEffect(() => {
    const socket = new WebSocket(createWebSocketURL());
    return () => {
      socket.close();
    };
  }, []);

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

function createWebSocketURL() {
  const url = new URL('/ws/connect', window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
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
      return (
        <>
          <h1>You broke it!?</h1>
          <button onClick={() => setScreen('hub')}>We have to go back</button>
        </>
      );
  }
}

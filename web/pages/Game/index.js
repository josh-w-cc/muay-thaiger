import React from 'react';

import CharacterSelect from '../../orig/src/menus/CharacterSelect';
import Fight from '../../orig/src/menus/Fight';
import Header from './Header.js';
import Hub from '../../orig/src/menus/Hub.jsx';
import Shop from '../../orig/src/menus/Shop';
import Train from '../../orig/src/menus/Train';

import './Game.css';
import '../../orig/src/index.css';

export function loader() {
  return null;
}

export default function Game() {
  const didRespondToAuth = React.useRef(false);
  const didSelectFighter = React.useRef(false);
  const didReceiveAuthRequest = React.useRef(false);
  const socketRef = React.useRef(null);
  const [screen, setScreen] = React.useState('character-select');

  React.useEffect(() => {
    const socket = new WebSocket(createWebSocketURL());
    socketRef.current = socket;
    socket.onmessage = (event) => {
      if(getMessageType(event) !== 'auth') {
        return;
      }
      didReceiveAuthRequest.current = true;
      respondToAuth({
        didReceiveAuthRequest,
        didRespondToAuth,
        didSelectFighter,
        socket,
      });
    };
    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, []);

  if(screen === 'character-select') {
    return <CharacterSelect onExit={() => {
      didSelectFighter.current = true;
      respondToAuth({
        didReceiveAuthRequest,
        didRespondToAuth,
        didSelectFighter,
        socket: socketRef.current,
      });
      setScreen('hub');
    }} />;
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

function getMessageType(event) {
  try {
    return JSON.parse(event.data).type;
  }
  catch {
    return null;
  }
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

function respondToAuth({didReceiveAuthRequest, didRespondToAuth, didSelectFighter, socket}) {
  if(didRespondToAuth.current) {
    return;
  }
  if(!didReceiveAuthRequest.current || !didSelectFighter.current) {
    return;
  }
  if(!socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }
  didRespondToAuth.current = true;
  socket.send(JSON.stringify({type: 'new'}));
}

import React from 'react';

import GameApp from './Game.js';
import '../../orig/src/index.css';

export function loader() {
  return null;
}

export default function Game() {
  React.useEffect(() => {
    const socket = new WebSocket(createWebSocketURL());
    return () => {
      socket.close();
    };
  }, []);

  return <GameApp />;
}

function createWebSocketURL() {
  const url = new URL('/ws/connect', window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

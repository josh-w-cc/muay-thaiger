import React from 'react';


const messageListeners = new Set();
const pendingMessages = [];
let socket = null;


export function connectSocketOnAppLoad() {
  return connectSocket();
}

export default function useConnectSocket(onMessage) {
  const onMessageRef = React.useRef(onMessage);
  const socketRef = React.useRef(connectSocket());

  React.useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
  React.useEffect(() => subscribeToMessages({onMessageRef, socketRef}), []);

  return socketRef;
}

function connectSocket() {
  if(socket) {
    return socket;
  }
  socket = new WebSocket(createWebSocketURL());
  socket.onmessage = (event) => onSocketMessage({event, socket});
  return socket;
}

function createWebSocketURL() {
  const url = new URL('/ws/connect', window.location.href);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

function onSocketMessage({event, socket}) {
  const message = parseMessage(event);
  if(!message) {
    return;
  }
  const messagePayload = {message, socket};
  if(messageListeners.size === 0) {
    pendingMessages.push(messagePayload);
    return;
  }
  notifyListeners(messagePayload);
}

function parseMessage(event) {
  try {
    return JSON.parse(event.data);
  }
  catch {
    return null;
  }
}

function subscribeToMessages({onMessageRef, socketRef}) {
  socketRef.current = connectSocket();
  const listener = ({message, socket}) => onMessageRef.current({message, socket});
  messageListeners.add(listener);
  flushPendingMessages();
  return () => unsubscribeFromMessages(listener);
}

function notifyListeners(messagePayload) {
  for(const listener of messageListeners) {
    listener(messagePayload);
  }
}

function flushPendingMessages() {
  for(const messagePayload of pendingMessages) {
    notifyListeners(messagePayload);
  }
  pendingMessages.length = 0;
}

function unsubscribeFromMessages(listener) {
  messageListeners.delete(listener);
  if(!socket || messageListeners.size !== 0) {
    return;
  }
  socket.close();
  socket = null;
}

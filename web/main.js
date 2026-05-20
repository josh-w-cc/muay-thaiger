import {createRoot} from 'react-dom/client';
import {RouterProvider} from 'react-router-dom';

import {connectSocketOnAppLoad} from './pages/Game/useConnectSocket.js';
import router from './router.js';

import './globals.css';


connectSocketOnAppLoad();

createRoot(document.getElementById('root')).render(
  <RouterProvider fallbackElement={<div>Loading...</div>} router={router} />,
);

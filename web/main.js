import {createRoot} from 'react-dom/client';
import {RouterProvider} from 'react-router';

import router from './router.js';

import './globals.css';


createRoot(document.getElementById('root')).render(
  <RouterProvider fallbackElement={<div>Loading...</div>} router={router} />,
);

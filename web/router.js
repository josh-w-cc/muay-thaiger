import {createBrowserRouter} from 'react-router';

import RootLayout from './pages/RootLayout/index.js';
import NotFound from './pages/NotFound.js';


function lazyPage(importFn) {
  return async () => {
    const mod = await importFn();
    return {Component: mod.default, loader: mod.loader};
  };
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {path: '/:screen?', lazy: lazyPage(() => import('./pages/Game/index.js'))},
      {path: '*', element: <NotFound />},
    ],
  },
]);

export default router;

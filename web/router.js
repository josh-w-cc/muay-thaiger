import {createBrowserRouter} from 'react-router-dom';

import Fallback from './pages/Game/Fallback.js';
import {GameLayout, loader as gameLayoutLoader} from './pages/Game/GameLayout.js';
import Game, {fighterSelectLoader} from './pages/Game/index.js';
import RootLayout from './pages/RootLayout/index.js';
import NotFound from './pages/NotFound.js';


function lazyPage(importFn) {
  return async () => {
    const mod = await importFn();
    return {Component: mod.default};
  };
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {element: <Game />, index: true, loader: fighterSelectLoader},
      {
        children: [
          {path: 'fight', lazy: lazyPage(() => import('./pages/Fight/index.js'))},
          {path: 'hub', lazy: lazyPage(() => import('./pages/Hub/index.js'))},
          {path: 'shop', lazy: lazyPage(() => import('./pages/Shop/index.js'))},
          {path: 'train', lazy: lazyPage(() => import('./pages/Train/index.js'))},
          {path: '*', element: <Fallback />},
        ],
        Component: GameLayout,
        loader: gameLayoutLoader,
      },
      {path: '*', element: <NotFound />},
    ],
  },
]);

export default router;

import {createBrowserRouter} from 'react-router-dom';
import {setWebsocketRouter} from '@/actions/websockets/state/router.js';

import Game, {fighterSelectLoader} from './pages/Game/index.js';
import gameLayoutRoutes from './pages/GameLayout/router.js';
import RootLayout from './pages/RootLayout/index.js';
import NotFound from './pages/NotFound.js';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {element: <Game />, index: true, loader: fighterSelectLoader},
      {path: 'edit-user', lazy: lazyPage(() => import('./pages/EditUser/index.js'))},
      {path: 'server-down', lazy: lazyPage(() => import('./pages/ServerDown.js'))},
      gameLayoutRoutes,
      {path: '*', element: <NotFound />},
    ],
  },
]);

setWebsocketRouter(router);

export default router;

function lazyPage(importFn) {
  return async () => {
    const mod = await importFn();
    return {Component: mod.default, loader: mod.loader};
  };
}

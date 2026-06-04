import {createBrowserRouter} from 'react-router-dom';

import Game, {fighterSelectLoader} from './pages/Game/index.js';
import gameLayoutRoutes from './pages/GameLayout/router.js';
import Maintenance from './pages/Maintenance.js';
import RootLayout from './pages/RootLayout/index.js';
import NotFound from './pages/NotFound.js';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {element: <Game />, index: true, loader: fighterSelectLoader},
      {path: 'maintenance', element: <Maintenance />},
      {path: 'edit-user', lazy: lazyPage(() => import('./pages/EditUser/index.js'))},
      gameLayoutRoutes,
      {path: '*', element: <NotFound />},
    ],
  },
]);

export default router;

function lazyPage(importFn) {
  return async () => {
    const mod = await importFn();
    return {Component: mod.default, loader: mod.loader};
  };
}

import {createBrowserRouter} from 'react-router-dom';

import Game, {fighterSelectLoader} from './pages/Game/index.js';
import RootLayout from './pages/RootLayout/index.js';
import NotFound from './pages/NotFound.js';


function lazyPage(importFn, {component = 'default', loader} = {}) {
  return async () => {
    const mod = await importFn();
    const route = {Component: mod[component]};
    if(loader) {
      route.loader = mod[loader];
    }
    return route;
  };
}

const importGamePage = () => import('./pages/Game/index.js');

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {element: <Game />, index: true, loader: fighterSelectLoader},
      {
        children: [
          {path: 'fight', lazy: lazyPage(importGamePage, {component: 'FightScreen'})},
          {path: 'hub', lazy: lazyPage(importGamePage, {component: 'HubScreen'})},
          {path: 'shop', lazy: lazyPage(importGamePage, {component: 'ShopScreen'})},
          {path: 'train', lazy: lazyPage(importGamePage, {component: 'TrainScreen'})},
          {path: '*', lazy: lazyPage(importGamePage, {component: 'FallbackScreen'})},
        ],
        lazy: () => import('./pages/Game/GameLayout.js'),
      },
      {path: '*', element: <NotFound />},
    ],
  },
]);

export default router;

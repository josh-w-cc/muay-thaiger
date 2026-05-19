import {createBrowserRouter} from 'react-router-dom';

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
      {index: true, lazy: lazyPage(importGamePage, {loader: 'characterSelectLoader'})},
      {
        children: [
          {path: 'fight', lazy: lazyPage(importGamePage, {component: 'FightScreen'})},
          {path: 'hub', lazy: lazyPage(importGamePage, {component: 'HubScreen'})},
          {path: 'shop', lazy: lazyPage(importGamePage, {component: 'ShopScreen'})},
          {path: 'train', lazy: lazyPage(importGamePage, {component: 'TrainScreen'})},
          {path: '*', lazy: lazyPage(importGamePage, {component: 'FallbackScreen'})},
        ],
        lazy: lazyPage(importGamePage, {component: 'GameLayout', loader: 'gameScreenLoader'}),
      },
      {path: '*', element: <NotFound />},
    ],
  },
]);

export default router;

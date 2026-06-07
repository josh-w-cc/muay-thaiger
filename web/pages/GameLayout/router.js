import {redirect} from 'react-router-dom';

import Fallback from './Fallback.js';
import {GameLayout, loader as gameLayoutLoader} from './index.js';


const gameLayoutRoutes = {
  children: [
    {index: true, loader: () => redirect('/fight')},
    {path: 'fight', lazy: lazyPage(() => import('./Fight/index.js'))},
    {path: 'hub', lazy: lazyPage(() => import('./Hub/index.js'))},
    {path: 'shop', lazy: lazyPage(() => import('./Shop/index.js'))},
    {path: 'train', lazy: lazyPage(() => import('./Train/index.js'))},
    {path: '*', element: <Fallback />},
  ],
  Component: GameLayout,
  loader: gameLayoutLoader,
};

export default gameLayoutRoutes;

function lazyPage(importFn) {
  return async () => {
    const mod = await importFn();
    return {Component: mod.default};
  };
}

import {createBrowserRouter} from 'react-router-dom';

import Game, {fighterSelectLoader} from './pages/Game/index.js';
import gameLayoutRoute from './pages/GameLayout/router.js';
import RootLayout from './pages/RootLayout/index.js';
import NotFound from './pages/NotFound.js';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {element: <Game />, index: true, loader: fighterSelectLoader},
      gameLayoutRoute,
      {path: '*', element: <NotFound />},
    ],
  },
]);

export default router;

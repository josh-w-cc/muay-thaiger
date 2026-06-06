let router = null;

export function setWebsocketRouter(nextRouter) {
  if(nextRouter !== null && typeof nextRouter?.navigate !== 'function') {
    throw new TypeError('Expected router with a navigate function or null.');
  }
  router = nextRouter;
}

export function navigateWithWebsocketRouter(path) {
  router?.navigate(path);
}

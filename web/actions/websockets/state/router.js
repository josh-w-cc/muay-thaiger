let router = null;

export function setWebsocketRouter(nextRouter) {
  router = nextRouter;
}

export function navigateWithWebsocketRouter(path) {
  router?.navigate(path);
}

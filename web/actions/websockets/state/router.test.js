import {afterEach, describe, expect, it, vi} from 'vitest';

import {navigateWithWebsocketRouter, setWebsocketRouter} from './router.js';


describe('websocket router state', () => {
  afterEach(() => {
    setWebsocketRouter(null);
  });

  it('navigates with the registered router', () => {
    const navigate = vi.fn();
    setWebsocketRouter({navigate});

    navigateWithWebsocketRouter('/hub');

    expect(navigate).toHaveBeenCalledWith('/hub');
  });

  it('throws when setting an invalid router object', () => {
    expect(() => setWebsocketRouter({})).toThrowError(TypeError);
  });

  it('does nothing when navigating without a registered router', () => {
    expect(() => navigateWithWebsocketRouter('/hub')).not.toThrow();
  });
});

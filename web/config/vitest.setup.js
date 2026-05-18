import {beforeEach, vi} from 'vitest';

import '@testing-library/jest-dom/vitest';


globalThis.ResizeObserver = class {
  constructor(cb) { this._cb = cb; }
  disconnect() {}
  observe() {}
  unobserve() {}
};

const localStorageMock = (() => {
  let store = {};
  return {
    clear: () => { store = {}; },
    getItem: (key) => store[key] ?? null,
    removeItem: (key) => { delete store[key]; },
    setItem: (key, value) => { store[key] = String(value); },
  };
})();

Object.defineProperty(globalThis, 'localStorage', {value: localStorageMock});

beforeEach(() => {
  localStorageMock.clear();
  HTMLDialogElement.prototype.showModal = vi.fn(function () {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function () {
    this.removeAttribute('open');
  });
});

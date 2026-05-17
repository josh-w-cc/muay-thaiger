import {beforeEach, vi} from 'vitest';

import '@testing-library/jest-dom/vitest';


globalThis.ResizeObserver = class {
  constructor(cb) { this._cb = cb; }
  disconnect() {}
  observe() {}
  unobserve() {}
};

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function () {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function () {
    this.removeAttribute('open');
  });
});

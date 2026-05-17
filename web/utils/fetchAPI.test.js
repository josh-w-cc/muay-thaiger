import {vi} from 'vitest';

const {default: fetchAPI, fetchJSON} = await import('./fetchAPI.js');


describe('fetchAPI', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('prepends /api/ to the path', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({ok: true});
    vi.stubGlobal('fetch', mockFetch);
    await fetchAPI('tasks/1', 'PUT', {title: 'Hello'});
    expect(mockFetch).toHaveBeenCalledWith('/api/tasks/1', {
      body: '{"title":"Hello"}',
      headers: {'Content-Type': 'application/json'},
      method: 'PUT',
    });
  });

  it('returns the fetch response', async () => {
    const response = {ok: true, json: vi.fn()};
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(response));
    const result = await fetchAPI('tasks', 'POST', {title: 'New'});
    expect(result).toBe(response);
  });
});

describe('fetchJSON', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends a GET request via fetchAPI', async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve({id: 1}),
    });
    vi.stubGlobal('fetch', mockFetch);
    await fetchJSON('tasks/1');
    expect(mockFetch).toHaveBeenCalledWith('/api/tasks/1', {method: 'GET'});
  });

  it('returns parsed JSON', async () => {
    const data = {id: 1, title: 'Test'};
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve(data),
    }));
    const result = await fetchJSON('tasks/1');
    expect(result).toEqual(data);
  });
});

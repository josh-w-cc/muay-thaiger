import {act, renderHook} from '@testing-library/react';

import usePunchAnimation from './usePunchAnimation.js';


describe('usePunchAnimation', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('returns isPunching as false and a triggerPunch function initially', () => {
    const {result} = renderHook(() => usePunchAnimation());

    expect(result.current.isPunching).toBe(false);
    expect(typeof result.current.triggerPunch).toBe('function');
  });

  it('sets isPunching to true when triggerPunch is called', () => {
    vi.useFakeTimers();
    const {result} = renderHook(() => usePunchAnimation());

    act(() => {
      result.current.triggerPunch();
    });

    expect(result.current.isPunching).toBe(true);
  });

  it('resets isPunching to false after the punch display time', () => {
    vi.useFakeTimers();
    const {result} = renderHook(() => usePunchAnimation());

    act(() => {
      result.current.triggerPunch();
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isPunching).toBe(false);
  });

  it('ignores additional triggerPunch calls during cooldown', () => {
    vi.useFakeTimers();
    const {result} = renderHook(() => usePunchAnimation());

    act(() => {
      result.current.triggerPunch();
    });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    act(() => {
      result.current.triggerPunch();
    });

    expect(result.current.isPunching).toBe(false);
  });

  it('allows triggering a new punch after the cooldown expires', () => {
    vi.useFakeTimers();
    const {result} = renderHook(() => usePunchAnimation());

    act(() => {
      result.current.triggerPunch();
    });
    act(() => {
      vi.advanceTimersByTime(600);
    });
    act(() => {
      result.current.triggerPunch();
    });

    expect(result.current.isPunching).toBe(true);
  });
});

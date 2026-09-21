import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { AppState } from 'react-native';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { invalidateMediaSession } from '@/lib/media-session';

let mockFocused = true;
let mockAppListener: (state: string) => void;
let mockAuthListener: (event: string) => void;
jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => () => void) => {
    const { useEffect } = jest.requireActual<typeof import('react')>('react');
    const focused = mockFocused;
    useEffect(() => (focused ? callback() : undefined), [callback, focused]);
  },
}));
jest.mock('react-native', () => ({
  AppState: {
    currentState: 'active',
    addEventListener: (_event: string, callback: (state: string) => void) => {
      mockAppListener = callback;
      return { remove: jest.fn() };
    },
  },
}));
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      onAuthStateChange: (callback: (event: string) => void) => {
        mockAuthListener = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      },
    },
  },
}));
let state: ReturnType<typeof useProtectedResource<string[]>>;
function Probe({ load }: { load: () => Promise<string[]> }) {
  state = useProtectedResource(load, 10_000);
  return null;
}
let renderer: ReactTestRenderer;
const load = jest.fn<Promise<string[]>, []>();
async function mount() {
  await act(async () => {
    renderer = create(createElement(Probe, { load }));
  });
}
async function advance() {
  await act(async () => {
    jest.advanceTimersByTime(10_000);
  });
}
function deferred() {
  let resolve!: (value: string[]) => void;
  const promise = new Promise<string[]>((yes) => {
    resolve = yes;
  });
  return { promise, resolve };
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.useFakeTimers();
  mockFocused = true;
  Object.assign(AppState, { currentState: 'active' });
  load.mockReset().mockResolvedValue(['old']);
});
afterEach(async () => {
  if (renderer) await act(async () => renderer.unmount());
  jest.useRealTimers();
});

it('receives later updates while the same screen stays open', async () => {
  await mount();
  expect(state.data).toEqual(['old']);
  load.mockResolvedValue(['new']);
  await advance();
  expect(state.data).toEqual(['new']);
  expect(load).toHaveBeenCalledTimes(2);
});
it('clears private state in background, pauses polling, and refreshes immediately on foreground', async () => {
  await mount();
  await act(async () => {
    Object.assign(AppState, { currentState: 'background' });
    mockAppListener('background');
  });
  expect(state.data).toBeUndefined();
  await advance();
  expect(load).toHaveBeenCalledTimes(1);
  load.mockResolvedValue(['foreground']);
  await act(async () => {
    Object.assign(AppState, { currentState: 'active' });
    mockAppListener('active');
  });
  expect(state.data).toEqual(['foreground']);
});
it('stops on blur and revalidates on return to the screen', async () => {
  await mount();
  mockFocused = false;
  await act(async () => renderer.update(createElement(Probe, { load })));
  await advance();
  expect(load).toHaveBeenCalledTimes(1);
  mockFocused = true;
  load.mockResolvedValue(['returned']);
  await act(async () => renderer.update(createElement(Probe, { load })));
  expect(state.data).toEqual(['returned']);
});
it('discards a late previous-route response', async () => {
  const old = deferred();
  load.mockReturnValue(old.promise);
  await mount();
  const nextLoad = async () => ['new route'];
  await act(async () => renderer.update(createElement(Probe, { load: nextLoad })));
  await act(async () => old.resolve(['private old route']));
  expect(state.data).toEqual(['new route']);
});
it('invalidates pending reads immediately at account transition and waits for new sign-in', async () => {
  await mount();
  const pending = deferred();
  load.mockReturnValue(pending.promise);
  await advance();
  await act(async () => invalidateMediaSession());
  await act(async () => pending.resolve(['old account']));
  expect(state.data).toBeUndefined();
  await advance();
  expect(load).toHaveBeenCalledTimes(2);
  load.mockResolvedValue(['new account']);
  await act(async () => {
    mockAuthListener('SIGNED_IN');
    jest.advanceTimersByTime(0);
  });
  expect(state.data).toEqual(['new account']);
});
it('does not poll while signed out', async () => {
  await mount();
  await act(async () => mockAuthListener('SIGNED_OUT'));
  await advance();
  expect(state.data).toBeUndefined();
  expect(load).toHaveBeenCalledTimes(1);
});
it('does not overlap slow background loads and supports manual retry', async () => {
  await mount();
  const pending = deferred();
  load.mockReturnValue(pending.promise);
  await advance();
  await advance();
  expect(load).toHaveBeenCalledTimes(2);
  expect(state.data).toEqual(['old']);
  await act(async () => pending.resolve(['updated']));
  load.mockResolvedValue(['manual']);
  await act(async () => {
    await state.refresh();
  });
  expect(state.data).toEqual(['manual']);
});

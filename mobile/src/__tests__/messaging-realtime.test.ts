import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { AppState } from 'react-native';
import { useMessagingResource } from '@/hooks/useMessagingResource';
let mockAuthListeners: ((event: string) => void)[] = [];
let mockChanges: (() => void)[] = [];
const mockRemove = jest.fn();
const mockSession = jest.fn();
jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => () => void) => {
    const { useEffect } = jest.requireActual<typeof import('react')>('react');
    useEffect(callback, [callback]);
  },
}));
jest.mock('react-native', () => ({
  AppState: { currentState: 'active', addEventListener: () => ({ remove: jest.fn() }) },
}));
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: () => mockSession(),
      onAuthStateChange: (callback: (event: string) => void) => {
        mockAuthListeners.push(callback);
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      },
    },
    channel: () => {
      const channel = {
        on: (_event: string, _filter: unknown, callback: () => void) => {
          mockChanges.push(callback);
          return channel;
        },
        subscribe: jest.fn(),
      };
      return channel;
    },
    removeChannel: (...args: unknown[]) => mockRemove(...args),
  },
}));
let state: ReturnType<typeof useMessagingResource<string[]>>;
function Probe({ load }: { load: () => Promise<string[]> }) {
  state = useMessagingResource(load);
  return null;
}
let renderer: ReactTestRenderer;
const load = jest.fn<Promise<string[]>, []>();
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.useFakeTimers();
  Object.assign(AppState, { currentState: 'active' });
  mockAuthListeners = [];
  mockChanges = [];
  mockRemove.mockReset();
  mockSession.mockReset().mockResolvedValue({ data: { session: { user: { id: 'account' } } } });
  load.mockReset().mockResolvedValue(['authorized']);
});
afterEach(async () => {
  if (renderer) await act(async () => renderer.unmount());
  jest.useRealTimers();
});
async function mount() {
  await act(async () => {
    renderer = create(createElement(Probe, { load }));
  });
}
it('refreshes authorized data on realtime events without waiting for polling', async () => {
  await mount();
  expect(mockChanges).toHaveLength(3);
  load.mockResolvedValue(['authorized update']);
  await act(async () => {
    mockChanges[0]();
    jest.advanceTimersByTime(120);
  });
  expect(state.data).toEqual(['authorized update']);
  expect(load).toHaveBeenCalledTimes(2);
});
it('does not refill private state from realtime while backgrounded', async () => {
  await mount();
  Object.assign(AppState, { currentState: 'background' });
  await act(async () => {
    mockChanges[0]();
    jest.advanceTimersByTime(120);
  });
  expect(load).toHaveBeenCalledTimes(1);
});
it('clears visible data and removes subscriptions on logout', async () => {
  await mount();
  await act(async () => {
    mockAuthListeners.forEach((callback) => callback('SIGNED_OUT'));
    jest.advanceTimersByTime(10000);
  });
  expect(state.data).toBeUndefined();
  expect(mockRemove).toHaveBeenCalledTimes(1);
  expect(load).toHaveBeenCalledTimes(1);
});
it('keeps polling available when realtime session lookup fails', async () => {
  mockSession.mockRejectedValue(new Error('offline'));
  await mount();
  load.mockResolvedValue(['reconnected']);
  await act(async () => {
    jest.advanceTimersByTime(10000);
  });
  expect(state.data).toEqual(['reconnected']);
});

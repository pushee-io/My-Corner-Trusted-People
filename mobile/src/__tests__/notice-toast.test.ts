import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { Animated, PanResponder } from 'react-native';
import { NoticeToastOverlay } from '@/components/NoticeToast';
import type { Notice } from '@/lib/messaging';

let mockReduceMotion = false;
let mockScreenReader = false;
const mockStop = jest.fn();
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  StyleSheet: { create: (styles: unknown) => styles },
  AccessibilityInfo: {
    isReduceMotionEnabled: async () => mockReduceMotion,
    isScreenReaderEnabled: async () => mockScreenReader,
    addEventListener: () => ({ remove: jest.fn() }),
  },
  PanResponder: { create: jest.fn(() => ({ panHandlers: {} })) },
  Animated: {
    View: 'AnimatedView',
    Value: class {
      setValue() {}
      stopAnimation() {
        mockStop();
      }
    },
    timing: jest.fn(() => ({
      start: (done?: (result: { finished: boolean }) => void) => done?.({ finished: true }),
      stop: mockStop,
    })),
  },
}));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({ top: 24 }) }));
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Icon' }));
let view: ReactTestRenderer | undefined;
const notice = {
  id: 'notice',
  title: 'Safety update',
  body: 'Private message content must stay out of the banner',
  priority: 'critical',
  createdAt: '2026-10-10T08:00:00Z',
} as Notice;
const dismiss = jest.fn();
const open = jest.fn();
async function render() {
  await act(async () => {
    view = create(createElement(NoticeToastOverlay, { notice, onOpen: open, onDismiss: dismiss }));
  });
}
beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  mockReduceMotion = false;
  mockScreenReader = false;
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});
afterEach(async () => {
  await act(async () => view?.unmount());
  view = undefined;
  jest.useRealTimers();
});
it('overlays the top without exporting message bodies and opens only on explicit tap', async () => {
  await render();
  const overlay = view!.root.findByProps({ pointerEvents: 'box-none' });
  expect(overlay.props.style[0]).toMatchObject({ position: 'absolute', zIndex: 1000 });
  expect(overlay.props.style[1]).toMatchObject({ top: 28 });
  expect(JSON.stringify(view!.toJSON())).not.toContain(notice.body);
  expect(open).not.toHaveBeenCalled();
  const button = view!.root.findByProps({ accessibilityLabel: 'Open update: Safety update' });
  await act(async () => button.props.onPress());
  expect(open).toHaveBeenCalledTimes(1);
  expect(Animated.timing).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ toValue: 0, duration: 220, useNativeDriver: true }),
  );
});
it('supports swipe dismissal once and smooth upward exit', async () => {
  await render();
  const pan = jest.mocked(PanResponder.create).mock.calls.at(-1)![0];
  await act(async () => {
    pan.onPanResponderRelease!({} as never, { dy: -60, vy: -1 } as never);
    pan.onPanResponderRelease!({} as never, { dy: -60, vy: -1 } as never);
  });
  expect(dismiss).toHaveBeenCalledTimes(1);
  expect(Animated.timing).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({ toValue: -180, duration: 170 }),
  );
});
it('respects reduced motion and leaves screen-reader notices until explicit dismissal', async () => {
  mockReduceMotion = true;
  mockScreenReader = true;
  await render();
  await act(async () => jest.advanceTimersByTime(30000));
  expect(dismiss).not.toHaveBeenCalled();
  expect(Animated.timing).not.toHaveBeenCalled();
  const button = view!.root
    .findAllByType('Pressable' as never)
    .find((item) => item.props.accessibilityLabel === 'Dismiss update')!;
  await act(async () => button.props.onPress());
  expect(dismiss).toHaveBeenCalledTimes(1);
});
it('auto-dismisses after eight seconds', async () => {
  await render();
  await act(async () => jest.advanceTimersByTime(7999));
  expect(dismiss).not.toHaveBeenCalled();
  await act(async () => jest.advanceTimersByTime(1));
  expect(dismiss).toHaveBeenCalledTimes(1);
  await act(async () => view!.unmount());
  expect(mockStop).toHaveBeenCalled();
});

it('cancels pending dismissal when the overlay unmounts', async () => {
  const schedule = jest.spyOn(globalThis, 'setTimeout');
  const clear = jest.spyOn(globalThis, 'clearTimeout');
  await render();
  const index = schedule.mock.calls.map((call) => call[1]).lastIndexOf(8000);
  expect(index).toBeGreaterThanOrEqual(0);
  const timer = schedule.mock.results[index].value;
  await act(async () => view!.unmount());
  expect(clear).toHaveBeenCalledWith(timer);
  await act(async () => jest.advanceTimersByTime(9000));
  expect(dismiss).not.toHaveBeenCalled();
  schedule.mockRestore();
  clear.mockRestore();
});

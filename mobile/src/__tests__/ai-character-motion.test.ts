import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { AICharacterExperience } from '@/components/AICharacterExperience';
import { aiCharacters } from '@/lib/ai-characters';
const mockStart = jest.fn();
const mockStop = jest.fn();
let mockReduce = false;
let mockChangeMotion: (value: boolean) => void;
let mockAppChange: (state: string) => void;
jest.mock('expo-router', () => ({
  useFocusEffect: (fn: () => () => void) => {
    const React = jest.requireActual<typeof import('react')>('react');
    React.useEffect(fn, [fn]);
  },
}));
jest.mock('react-native', () => ({
  View: 'View', Text: 'Text', Image: 'Image', Pressable: 'Pressable',
  StyleSheet: { create: (s: unknown) => s },
  AppState: { currentState: 'active', addEventListener: (_: unknown, fn: (state: string) => void) => {
    mockAppChange = fn; return { remove: jest.fn() };
  } },
  AccessibilityInfo: {
    isReduceMotionEnabled: async () => mockReduce,
    addEventListener: (_: unknown, fn: (value: boolean) => void) => { mockChangeMotion = fn; return { remove: jest.fn() }; },
  },
  Animated: {
    View: 'AnimatedView',
    Value: class { stopAnimation() {} setValue() {} interpolate() { return 0; } },
    timing: jest.fn(),
    sequence: () => ({ start: mockStart, stop: mockStop }),
    loop: () => ({ start: mockStart, stop: mockStop }),
  },
}));
let view: ReactTestRenderer;
beforeEach(() => { jest.clearAllMocks(); mockReduce = false; Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }); });
afterEach(async () => { await act(async () => view?.unmount()); });
it('exposes four accessible choices and matches the selected portrait to the full character', async () => {
  const select = jest.fn();
  await act(async () => { view = create(createElement(AICharacterExperience, {
    character: aiCharacters[2], selectCharacter: select, state: 'thinking',
  })); });
  const choices = view.root.findAllByType('Pressable' as never);
  expect(choices).toHaveLength(4);
  expect(choices.filter((choice) => choice.props.accessibilityState.checked)).toHaveLength(1);
  expect(choices[2].props.accessibilityState.checked).toBe(true);
  expect(choices.every((choice) => choice.props.accessibilityRole === 'radio')).toBe(true);
  await act(async () => choices[3].props.onPress());
  expect(select).toHaveBeenCalledWith('woman-purple');
});
it('stops active motion in the background and when Reduce Motion changes', async () => {
  await act(async () => { view = create(createElement(AICharacterExperience, {
    character: aiCharacters[0], selectCharacter: jest.fn(), state: 'idle',
  })); });
  expect(mockStart).toHaveBeenCalled();
  await act(async () => mockAppChange('background'));
  expect(mockStop).toHaveBeenCalled();
  const starts = mockStart.mock.calls.length;
  await act(async () => mockChangeMotion(true));
  await act(async () => mockAppChange('active'));
  expect(mockStart).toHaveBeenCalledTimes(starts);
});
it('uses a static state when Reduce Motion is enabled initially', async () => {
  mockReduce = true;
  await act(async () => { view = create(createElement(AICharacterExperience, {
    character: aiCharacters[1], selectCharacter: jest.fn(), state: 'thinking',
  })); });
  expect(mockStart).not.toHaveBeenCalled();
  expect(JSON.stringify(view.toJSON())).toContain('Checking your neighborhood');
});

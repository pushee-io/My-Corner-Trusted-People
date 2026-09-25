import { createElement, type ComponentType } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { router } from 'expo-router';
import AskScreen from '../../app/ask';
import { MessagesAccess } from '@/components/MessagesAccess';
import { AskMyCornerAccess } from '@/components/AskMyCornerAccess';
import {
  askFeedback,
  askNeighborhood,
  askSourceClick,
  reviewCountLabel,
  safeAskHref,
  type AskAnswer,
} from '@/lib/neighborhood-assistant';
let mockContext: unknown;
let mockPath = '/events';
let mockParams: { question?: string } = {};
let mockUnread = 0;
let mockClear: (() => void) | undefined;
let mockBackground: ((state: string) => void) | undefined;
jest.mock('react-native', () => ({
  View: 'View',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  Platform: { OS: 'android' },
  Text: 'Text',
  Pressable: 'Pressable',
  TextInput: 'TextInput',
  StyleSheet: { create: (s: unknown) => s },
  AppState: {
    addEventListener: (_: unknown, cb: (s: string) => void) => {
      mockBackground = cb;
      return { remove: jest.fn() };
    },
  },
}));
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
  usePathname: () => mockPath,
  useLocalSearchParams: () => mockParams,
  useFocusEffect: (cb: () => () => void) => {
    const React = jest.requireActual<typeof import('react')>('react');
    React.useEffect(cb, [cb]);
  },
}));
jest.mock('@/components/Screen', () => ({ Screen: ({ children }: { children: unknown }) => children }));
jest.mock('@/hooks/useProtectedResource', () => ({
  useProtectedResource: () => ({ data: mockContext, loading: false }),
}));
jest.mock('@/lib/media-session', () => ({
  subscribeMediaSession: (cb: () => void) => {
    mockClear = cb;
    return jest.fn();
  },
}));
jest.mock('@/hooks/useMessagingResource', () => ({ useMessagingResource: () => ({ data: { unread: mockUnread } }) }));
jest.mock('@/lib/messaging', () => ({ loadUnread: jest.fn() }));
jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('@/lib/neighborhood-assistant', () => ({
  ...jest.requireActual('@/lib/neighborhood-assistant'),
  askNeighborhood: jest.fn(),
  askFeedback: jest.fn(),
  askSourceClick: jest.fn(),
  loadAskContext: jest.fn(),
}));
const id = 'a1000000-0000-4000-8000-000000000001';
const fixture: AskAnswer = {
  id,
  version: 'ask-v1',
  intent: 'providers',
  neighborhood: 'East Legon',
  generatedAt: '2026-09-25T10:00:00Z',
  notice: 'Based on actual reviews.',
  excerpts: [],
  sources: [
    {
      id,
      kind: 'provider',
      title: 'Fictional FenceCare',
      text: 'Fictional fence repair service.',
      authority: 'Provider profile',
      publishedAt: '2026-09-25T10:00:00Z',
      href: `/hire/provider/${id}`,
      reputation: { average: 4, count: 1, verifiedCount: 1, recommendationPercent: null },
    },
  ],
};
let renderer: ReactTestRenderer;
const output = () => JSON.stringify(renderer.toJSON());
async function render(component: ComponentType = AskScreen) {
  await act(async () => {
    renderer = create(createElement(component));
  });
}
async function press(label: string) {
  const b = renderer.root
    .findAllByType('Pressable' as never)
    .find((n) => n.findAllByType('Text' as never).some((t) => t.children.join('') === label));
  expect(b).toBeDefined();
  await act(async () => {
    b!.props.onPress();
  });
}
async function ask() {
  await act(async () =>
    renderer.root
      .findByProps({ accessibilityLabel: 'Neighborhood question' })
      .props.onChangeText('Who can repair a fence nearby?'),
  );
  await press('Send');
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  jest.clearAllMocks();
  mockContext = { id, name: 'East Legon' };
  mockPath = '/events';
  mockParams = {};
  mockUnread = 0;
  jest.mocked(askNeighborhood).mockResolvedValue(fixture);
  jest.mocked(askFeedback).mockResolvedValue(undefined);
  jest.mocked(askSourceClick).mockResolvedValue(undefined);
});
afterEach(async () => {
  if (renderer) await act(async () => renderer.unmount());
});
it('shows actual reputation and source without visible internal IDs', async () => {
  await render();
  await ask();
  expect(output()).toContain('4.0 / 5 · 1 verified review');
  expect(output()).toContain('Fictional FenceCare');
  expect(output()).not.toContain(id);
  await press('View provider');
  expect(router.push).toHaveBeenCalledWith(`/hire/provider/${id}`);
});
it('routes Request help into existing product flow', async () => {
  await render();
  await ask();
  await press('Request help');
  expect(router.push).toHaveBeenCalledWith({ pathname: '/hire/request/new', params: { providerId: id } });
});
it('Search remains available during assistant failure', async () => {
  jest.mocked(askNeighborhood).mockRejectedValue(new Error('offline'));
  await render();
  await ask();
  expect(output()).toContain('temporarily unavailable');
  await press('Search your neighborhood');
  expect(router.push).toHaveBeenCalledWith('/search');
});
it('follow-up sends question-only context', async () => {
  await render();
  await ask();
  await act(async () =>
    renderer.root
      .findByProps({ accessibilityLabel: 'Neighborhood question' })
      .props.onChangeText('Which ones have reviews?'),
  );
  await press('Send');
  expect(askNeighborhood).toHaveBeenLastCalledWith('Which ones have reviews?', ['Who can repair a fence nearby?'], id);
});
it('feedback attaches to correct answer', async () => {
  await render();
  await ask();
  await press('Not helpful');
  expect(askFeedback).toHaveBeenCalledWith(id, 'not_helpful');
  expect(output()).toContain('feedback was saved');
});
it('account changes and background clear private context', async () => {
  await render();
  await ask();
  await act(async () => mockClear!());
  expect(output()).not.toContain('Fictional FenceCare');
  await ask();
  await act(async () => mockBackground!('background'));
  expect(output()).not.toContain('Fictional FenceCare');
});
it('late response cannot cross account transition', async () => {
  let resolve!: (a: AskAnswer) => void;
  jest.mocked(askNeighborhood).mockReturnValue(
    new Promise((r) => {
      resolve = r;
    }),
  );
  await render();
  await ask();
  await act(async () => mockClear!());
  await act(async () => resolve(fixture));
  expect(output()).not.toContain('Fictional FenceCare');
});
it('disabled context hides entry', async () => {
  mockContext = null;
  await render(AskMyCornerAccess);
  expect(renderer.toJSON()).toBeNull();
});
it('entry opens an empty assistant without making paid request', async () => {
  await render(AskMyCornerAccess);
  await press('Ask My Corner AI');
  expect(router.push).toHaveBeenCalledWith('/ask');
  expect(askNeighborhood).not.toHaveBeenCalled();
});
it('singular/plural grammar and source route allowlist', () => {
  expect(reviewCountLabel(1)).toBe('1 verified review');
  expect(reviewCountLabel(2)).toBe('2 verified reviews');
  expect(() => safeAskHref({ ...fixture.sources[0], href: 'https://attacker.example' })).toThrow();
});
it('zero review state never invents rating', async () => {
  jest.mocked(askNeighborhood).mockResolvedValue({
    ...fixture,
    sources: [
      { ...fixture.sources[0], reputation: { average: 0, count: 0, verifiedCount: 0, recommendationPercent: null } },
    ],
  });
  await render();
  await ask();
  expect(output()).toContain('No verified reviews yet.');
  expect(output()).not.toContain('4.0 / 5');
});

it('Home keeps one accessible assistant entry without suggestion questions', async () => {
  mockPath = '/home';
  await render(() => createElement(AskMyCornerAccess, { home: true }));
  expect(output()).toContain('Ask My Corner');
  expect(output()).toContain('Ask anything about your neighborhood.');
  for (const prompt of [
    'What’s happening this weekend?',
    'Find local help',
    'Any important alerts?',
    'What did I miss?',
  ]) {
    expect(output()).not.toContain(prompt);
  }
  const targets = renderer.root.findAllByType('Pressable' as never);
  expect(targets).toHaveLength(1);
  expect(targets[0].props).toMatchObject({
    accessibilityRole: 'button',
    accessibilityLabel: 'Ask My Corner AI',
    focusable: true,
  });
  await press('Ask My Corner AI');
  expect(router.push).toHaveBeenCalledWith('/ask');
  expect(askNeighborhood).not.toHaveBeenCalled();
});
const input = () => renderer.root.findByProps({ accessibilityLabel: 'Neighborhood question' });
const pill = (label: string) =>
  renderer.root.findAllByType('Pressable' as never).find((n) => n.props.accessibilityLabel === label)!;
it('starts empty with a placeholder and clears submitted input', async () => {
  await render();
  expect(input().props.value).toBe('');
  expect(input().props.placeholder).toBe('Ask anything about your neighborhood...');
  expect(pill('Send').props.disabled).toBe(true);
  await act(async () => input().props.onChangeText('   '));
  await press('Send');
  expect(askNeighborhood).not.toHaveBeenCalled();
  await ask();
  expect(askNeighborhood).toHaveBeenCalledWith('Who can repair a fence nearby?', [], id);
  expect(input().props.value).toBe('');
  expect(input().props.placeholder).toBe('Ask anything about your neighborhood...');
  expect(output()).toContain('Who can repair a fence nearby?');
  expect(pill('Send').props.disabled).toBe(true);
});
it('Search handoff is optional and never autofills or auto-submits', async () => {
  mockParams = { question: 'What is happening this weekend?' };
  await render();
  expect(input().props.value).toBe('');
  expect(askNeighborhood).not.toHaveBeenCalled();
  await press('Ask about: What is happening this weekend?');
  expect(askNeighborhood).toHaveBeenCalledWith(mockParams.question, [], id);
  expect(input().props.value).toBe('');
});
it('Search entry retains its actual query', async () => {
  await render(() => createElement(AskMyCornerAccess, { question: 'Who can repair a fence?' }));
  await press('Ask My Corner AI');
  expect(router.push).toHaveBeenCalledWith({ pathname: '/ask', params: { question: 'Who can repair a fence?' } });
});
it('clears immediately and rejects duplicate sends before a rerender', async () => {
  let resolve!: (value: AskAnswer) => void;
  jest.mocked(askNeighborhood).mockReturnValue(
    new Promise((r) => {
      resolve = r;
    }),
  );
  await render();
  await act(async () => input().props.onChangeText('Who can repair a fence?'));
  const send = pill('Send').props.onPress;
  await act(async () => {
    send();
    send();
  });
  expect(askNeighborhood).toHaveBeenCalledTimes(1);
  expect(input().props.value).toBe('');
  expect(output()).toContain('My Corner AI is checking your neighborhood...');
  expect(pill('Checking neighborhood sources…').props.disabled).toBe(true);
  await act(async () => resolve(fixture));
  expect(input().props.editable).toBe(true);
});
it('pill supports 48dp touch, wrapping, pressed and focus states', async () => {
  await render(AskMyCornerAccess);
  const normal = pill('Ask My Corner AI').props.style({ pressed: false });
  expect(normal).toMatchObject({ minHeight: 48, maxWidth: '100%', flexShrink: 1, borderRadius: 999 });
  expect(pill('Ask My Corner AI').props.style({ pressed: true }).backgroundColor).not.toBe(normal.backgroundColor);
  await act(async () => pill('Ask My Corner AI').props.onFocus());
  expect(pill('Ask My Corner AI').props.style({ pressed: false }).borderColor).not.toBe(normal.borderColor);
  await act(async () => pill('Ask My Corner AI').props.onBlur());
  expect(pill('Ask My Corner AI').props.style({ pressed: false }).borderColor).toBe(normal.borderColor);
  await press('Ask My Corner AI');
  expect(router.push).toHaveBeenCalledWith('/ask');
});
it.each([0, 3])('Messages preserves unread count %s and navigation', async (unread) => {
  mockUnread = unread;
  await render(MessagesAccess);
  const target = pill(`Messages, ${unread} unread`);
  expect(target.props.accessibilityRole).toBe('button');
  expect(target.props.style({ pressed: false }).minHeight).toBe(48);
  await press(unread ? `Messages (${unread})` : 'Messages');
  expect(router.push).toHaveBeenCalledWith('/messages');
  await press('Notifications');
  expect(router.push).toHaveBeenLastCalledWith('/notifications');
});

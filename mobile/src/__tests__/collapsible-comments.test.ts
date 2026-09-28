import { Keyboard, TextInput } from 'react-native';
import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import {
  CollapsibleComments,
  CommentsProvider,
  dismissCommentKeyboard,
  useCommentDraft,
} from '@/components/CollapsibleComments';
import { invalidateMediaSession } from '@/lib/media-session';
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TextInput: { State: { currentlyFocusedInput: jest.fn() } },
  Pressable: 'Pressable',
  Modal: 'Modal',
  ScrollView: 'ScrollView',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  Platform: { OS: 'android' },
  Keyboard: { dismiss: jest.fn() },
  StyleSheet: { create: (s: unknown) => s },
}));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('expo-router', () => ({ useFocusEffect: () => {} }));
let renderer: ReactTestRenderer;
function Harness({ busy = false, count = 2 }) {
  const [draft, setDraft] = useCommentDraft('');
  return createElement(
    CommentsProvider,
    null,
    ...['A', 'B'].map((id) =>
      // Required render-prop children, rather than a normal React child.
      // eslint-disable-next-line react/no-children-prop
      createElement(CollapsibleComments, {
        key: id,
        id,
        count,
        busy,
        children: ({ onFocus, onBlur }) =>
          createElement('Composer', { onFocus, onBlur, value: draft, onChangeText: setDraft }),
      }),
    ),
  );
}
async function render(props = {}) {
  await act(async () => {
    renderer = create(createElement(Harness, props));
  });
}
const buttons = (label: string) =>
  renderer.root.findAllByType('Pressable' as never).filter((n) => n.props.accessibilityLabel === label);
const modals = () => renderer.root.findAllByType('Modal' as never);
async function press(label: string, index = 0) {
  await act(async () => buttons(label)[index].props.onPress());
}
beforeEach(() => Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }));
afterEach(async () => {
  await act(async () => renderer.unmount());
});
it('starts collapsed, expands accessibly and explicit Hide closes', async () => {
  await render();
  expect(modals().every((n) => !n.props.visible)).toBe(true);
  await press('2 comments, collapsed');
  expect(buttons('2 comments, expanded')[0].props.accessibilityState.expanded).toBe(true);
  expect(renderer.root.findAllByType('Composer' as never)).toHaveLength(1);
  await press('Hide comments');
  expect(modals().every((n) => !n.props.visible)).toBe(true);
});
it('outside tap closes even when composer is focused and preserves draft', async () => {
  await render();
  await press('2 comments, collapsed');
  const c = renderer.root.findByType('Composer' as never);
  await act(async () => {
    c.props.onFocus();
    c.props.onChangeText('Unsent text');
  });
  await press('Close comments');
  expect(modals()[0].props.visible).toBe(false);
  await press('2 comments, collapsed');
  expect(renderer.root.findByType('Composer' as never).props.value).toBe('Unsent text');
});
it('has no dismissal handler on the thread and supports system Back', async () => {
  await render();
  await press('2 comments, collapsed');
  const thread = renderer.root.findAllByProps({ accessibilityViewIsModal: true })[0];
  expect(thread.props.onPress).toBeUndefined();
  await act(async () => modals()[0].props.onRequestClose());
  expect(modals()[0].props.visible).toBe(false);
});
it('does not dismiss during submission', async () => {
  await render({ busy: true });
  await press('2 comments, collapsed');
  await press('Close comments');
  await act(async () => modals()[0].props.onRequestClose());
  expect(modals()[0].props.visible).toBe(true);
  expect(buttons('Hide comments')[0].props.disabled).toBe(true);
});
it('allows only one thread and updates count without resetting its state', async () => {
  await render();
  await press('2 comments, collapsed');
  await press('2 comments, collapsed');
  expect(modals().filter((n) => n.props.visible)).toHaveLength(1);
  expect(modals()[1].props.visible).toBe(true);
  await act(async () => renderer.update(createElement(Harness, { count: 3 })));
  expect(buttons('3 comments, expanded')).toHaveLength(1);
});
it('closes private comment content on account transition', async () => {
  await render();
  await press('2 comments, collapsed');
  await act(async () => invalidateMediaSession());
  expect(modals().every((n) => !n.props.visible)).toBe(true);
});

it('Back dismisses the keyboard before closing comments and keeps unsent text', async () => {
  await render();
  await press('2 comments, collapsed');
  const composer = renderer.root.findByType('Composer' as never);
  await act(async () => {
    composer.props.onFocus();
    composer.props.onChangeText('Unsent');
  });
  await act(async () => modals()[0].props.onRequestClose());
  expect(modals()[0].props.visible).toBe(true);
  expect(Keyboard.dismiss).toHaveBeenCalled();
  await act(async () => modals()[0].props.onRequestClose());
  expect(modals()[0].props.visible).toBe(false);
  await press('2 comments, collapsed');
  expect(renderer.root.findByType('Composer' as never).props.value).toBe('Unsent');
});
it('successful comment completion blurs the actual composer and dismisses the keyboard', async () => {
  await render();
  const blur = jest.fn();
  jest.mocked(TextInput.State.currentlyFocusedInput).mockReturnValue({ blur } as never);
  dismissCommentKeyboard();
  expect(blur).toHaveBeenCalled();
  expect(Keyboard.dismiss).toHaveBeenCalled();
});

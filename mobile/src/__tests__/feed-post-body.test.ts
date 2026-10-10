import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { FeedPostBody } from '@/components/FeedPostBody';

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  StyleSheet: { create: (styles: unknown) => styles },
}));
let view: ReactTestRenderer;
beforeEach(() => Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true }));
afterEach(async () => {
  await act(async () => view.unmount());
});
const button = () => view.root.findByType('Pressable' as never);
const bodyText = () => view.root.findAllByType('Text' as never)[0];

it.each(['', 'A short update.'])('does not truncate or add an expansion control to short text: %s', async (body) => {
  await act(async () => {
    view = create(createElement(FeedPostBody, { body }));
  });
  expect(bodyText().props.numberOfLines).toBeUndefined();
  expect(view.root.findAllByType('Pressable' as never)).toHaveLength(0);
});

it.each(['A long neighborhood update. '.repeat(20), 'One\nTwo\nThree\nFour\nFive\nSix'])(
  'expands all original content and collapses again',
  async (body) => {
    await act(async () => {
      view = create(createElement(FeedPostBody, { body }));
    });
    expect(bodyText().children.join('')).toBe(body);
    expect(bodyText().props.numberOfLines).toBe(5);
    expect(button().props.accessibilityState.expanded).toBe(false);
    await act(async () => button().props.onPress());
    expect(bodyText().props.numberOfLines).toBeUndefined();
    expect(button().props.accessibilityState.expanded).toBe(true);
    await act(async () => button().props.onPress());
    expect(bodyText().props.numberOfLines).toBe(5);
    expect(bodyText().children.join('')).toBe(body);
  },
);

it('resets expansion when the content changes and has visible press/focus feedback', async () => {
  await act(async () => {
    view = create(createElement(FeedPostBody, { body: 'First update '.repeat(30) }));
  });
  const style = (pressed: boolean) => Object.assign({}, ...button().props.style({ pressed }));
  expect(style(false).minHeight).toBeGreaterThanOrEqual(48);
  expect(style(false).backgroundColor).not.toBe(style(true).backgroundColor);
  const border = style(false).borderColor;
  await act(async () => button().props.onFocus());
  expect(style(false).borderColor).not.toBe(border);
  await act(async () => button().props.onPress());
  await act(async () => view.update(createElement(FeedPostBody, { body: 'Replacement '.repeat(30) })));
  expect(button().props.accessibilityState.expanded).toBe(false);
});

import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { ActionPill } from '@/components/ActionPill';
import { EmptyState, ErrorState, LoadingState, OfflineBanner, SuccessState } from '@/components/StateBlocks';
import { Surface } from '@/components/Surface';
import { tokens } from '@/theme/tokens';

let mockConnected: boolean | null = true;
jest.mock('@react-native-community/netinfo', () => ({
  useNetInfo: () => ({ isConnected: mockConnected, isInternetReachable: mockConnected }),
}));
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Pressable: 'Pressable',
  StyleSheet: { create: (styles: unknown) => styles },
}));

let renderer: ReactTestRenderer;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  mockConnected = true;
});
afterEach(async () => {
  if (renderer) await act(async () => renderer.unmount());
});
async function render(element: ReturnType<typeof createElement>) {
  await act(async () => {
    renderer = create(element);
  });
}
const buttons = () => renderer.root.findAllByType('Pressable' as never);
const output = () => JSON.stringify(renderer.toJSON());

function luminance(hex: string) {
  const channels = hex.match(/[a-f\d]{2}/gi)!.map((part) => {
    const value = parseInt(part, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

it('keeps the action label, accessible name and callback through a disabled/enabled transition', async () => {
  const onPress = jest.fn();
  const props = { label: 'Continue to review', accessibilityLabel: 'Review this request', onPress };
  await render(createElement(ActionPill, props));
  expect(buttons()[0].props.accessibilityLabel).toBe('Review this request');
  await act(async () => buttons()[0].props.onPress());
  expect(onPress).toHaveBeenCalledTimes(1);
  await act(async () => renderer.update(createElement(ActionPill, { ...props, disabled: true })));
  expect(buttons()[0].props.disabled).toBe(true);
  expect(buttons()[0].props.accessibilityState).toEqual({ disabled: true });
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(output()).toContain('Continue to review');
  await act(async () => renderer.update(createElement(ActionPill, props)));
  await act(async () => buttons()[0].props.onPress());
  expect(onPress).toHaveBeenCalledTimes(2);
});

it.each([
  [false, false],
  [true, false],
  [false, true],
  [true, true],
])('keeps readable labels and large targets for primary=%s, disabled=%s', async (primary, disabled) => {
  await render(
    createElement(ActionPill, { label: 'A long action label can wrap', primary, disabled, onPress: jest.fn() }),
  );
  const button = buttons()[0];
  const text = button.findByType('Text' as never);
  for (const pressed of [false, true]) {
    const style = button.props.style({ pressed });
    expect(contrast(text.props.style.color, style.backgroundColor)).toBeGreaterThanOrEqual(4.5);
    expect(style.minHeight).toBeGreaterThanOrEqual(48);
    expect(style.height).toBeUndefined();
    expect(text.props.numberOfLines).toBeUndefined();
    expect(text.props.allowFontScaling).not.toBe(false);
    if (!disabled)
      expect(
        // The boundary is judged against the adjacent surface, not its own fill.
        contrast(style.borderColor, tokens.color.surface),
      ).toBeGreaterThanOrEqual(3);
  }
});

it('shows pressed and keyboard focus feedback without changing the control geometry', async () => {
  await render(createElement(ActionPill, { label: 'Search', onPress: jest.fn() }));
  const before = buttons()[0].props.style({ pressed: false });
  expect(buttons()[0].props.style({ pressed: true }).backgroundColor).not.toBe(before.backgroundColor);
  await act(async () => buttons()[0].props.onFocus());
  const focused = buttons()[0].props.style({ pressed: false });
  expect(focused.borderColor).not.toBe(before.borderColor);
  expect(contrast(focused.borderColor, focused.backgroundColor)).toBeGreaterThanOrEqual(3);
  expect(focused.borderWidth).toBe(before.borderWidth);
  expect(focused.paddingVertical).toBe(before.paddingVertical);
  await act(async () => buttons()[0].props.onBlur());
  expect(buttons()[0].props.style({ pressed: false })).toEqual(before);
});

it('retains the actionable error and calls only the supplied retry', async () => {
  const retry = jest.fn();
  await render(
    createElement(ErrorState, {
      title: 'Search unavailable',
      body: 'Check your connection and try again.',
      onRetry: retry,
    }),
  );
  expect(output()).toContain('Search unavailable');
  expect(output()).toContain('Check your connection and try again.');
  expect(buttons()).toHaveLength(1);
  expect(buttons()[0].props.accessibilityRole).toBe('button');
  expect(buttons()[0].props.accessibilityLabel).toBe('Try again');
  expect(buttons()[0].props.style({ pressed: false }).minHeight).toBeGreaterThanOrEqual(48);
  await act(async () => buttons()[0].props.onPress());
  expect(retry).toHaveBeenCalledTimes(1);
  await act(async () =>
    renderer.update(createElement(ErrorState, { title: 'Unavailable', body: 'Access is required.' })),
  );
  expect(buttons()).toHaveLength(0);
});

it.each([EmptyState, SuccessState])('retains supplied state copy without adding actions', async (Component) => {
  await render(createElement(Component, { title: 'State title', body: 'State details' }));
  expect(output()).toContain('State title');
  expect(output()).toContain('State details');
  expect(buttons()).toHaveLength(0);
});

it('labels the progress state without inventing a completion percentage', async () => {
  await render(createElement(LoadingState, { title: 'Loading groups' }));
  const progress = renderer.root.findByType(Surface);
  expect(progress.props.accessibilityRole).toBe('progressbar');
  expect(progress.props.accessibilityLabel).toBe('Loading groups');
  expect(progress.props.accessibilityState).toEqual({ busy: true });
  expect(progress.props.accessibilityValue).toBeUndefined();
});

it('shows offline copy and retry only when the network reports offline', async () => {
  const retry = jest.fn();
  await render(createElement(OfflineBanner, { onRetry: retry }));
  expect(renderer.toJSON()).toBeNull();
  mockConnected = null;
  await act(async () => renderer.update(createElement(OfflineBanner, { onRetry: retry })));
  expect(renderer.toJSON()).toBeNull();
  mockConnected = false;
  await act(async () => renderer.update(createElement(OfflineBanner, { onRetry: retry })));
  expect(output()).toContain('You appear to be offline.');
  await act(async () => buttons()[0].props.onPress());
  expect(retry).toHaveBeenCalledTimes(1);
});

it('keeps body and metadata readable on every migrated surface', () => {
  for (const background of [
    tokens.color.surface,
    tokens.color.surfaceMuted,
    tokens.color.successSurface,
    tokens.color.warningSurface,
  ]) {
    for (const foreground of [tokens.color.textPrimary, tokens.color.textSecondary]) {
      expect(contrast(foreground, background)).toBeGreaterThanOrEqual(4.5);
    }
  }
});

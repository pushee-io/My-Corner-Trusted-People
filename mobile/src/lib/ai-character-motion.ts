export type AIMotionState = 'idle' | 'listening' | 'thinking' | 'answer' | 'happy' | 'attention' | 'surprised';
export type CharacterExpression = 'happy' | 'blink' | 'speaking' | 'surprised';
export type ArtRect = { x: number; y: number; width: number; height: number };

/** Millisecond timeline, not random renders. Answer mouth movement ends after 2.4s. */
export function characterExpressionAt(state: AIMotionState, elapsed: number): CharacterExpression {
  if ((state === 'attention' || state === 'surprised') && elapsed < 650) return 'surprised';
  const blinkTime = elapsed % 4700;
  if (blinkTime >= 3200 && blinkTime < 3440) return 'blink';
  if ((state === 'answer' && elapsed < 2400) || (state === 'idle' && elapsed < 1000)) {
    return Math.floor(elapsed / 240) % 2 === 0 ? 'speaking' : 'happy';
  }
  return 'happy';
}

/** Non-overlapping original-art regions around the separately articulated pieces. */
export function subtractArtRect(rect: ArtRect, cut: ArtRect): ArtRect[] {
  const left = Math.max(rect.x, cut.x),
    top = Math.max(rect.y, cut.y);
  const right = Math.min(rect.x + rect.width, cut.x + cut.width);
  const bottom = Math.min(rect.y + rect.height, cut.y + cut.height);
  if (right <= left || bottom <= top) return [rect];
  return [
    { x: rect.x, y: rect.y, width: rect.width, height: top - rect.y },
    { x: rect.x, y: bottom, width: rect.width, height: rect.y + rect.height - bottom },
    { x: rect.x, y: top, width: left - rect.x, height: bottom - top },
    { x: right, y: top, width: rect.x + rect.width - right, height: bottom - top },
  ].filter((part) => part.width > 0 && part.height > 0);
}

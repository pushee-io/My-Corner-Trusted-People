const mockRead = jest.fn();
const mockWrite = jest.fn();
jest.mock('react-native', () => ({ Platform: { OS: 'android' } }));
jest.mock('expo-secure-store', () => ({
  getItemAsync: (...args: unknown[]) => mockRead(...args),
  setItemAsync: (...args: unknown[]) => mockWrite(...args),
}));
jest.mock('react', () => ({
  useEffect: jest.fn(),
  useSyncExternalStore: (_subscribe: unknown, snapshot: () => unknown) => snapshot(),
}));
const load = () => jest.requireActual<typeof import('@/hooks/useAICharacter')>('@/hooks/useAICharacter');
beforeEach(() => { jest.resetModules(); mockRead.mockReset(); mockWrite.mockReset().mockResolvedValue(undefined); });
it('restores a valid device preference without storing any conversation or user data', async () => {
  mockRead.mockResolvedValue('woman-purple');
  const preference = load();
  await preference.loadAICharacterPreference();
  expect(preference.useAICharacter().character.id).toBe('woman-purple');
  preference.selectAICharacter('older-man');
  await Promise.resolve();
  expect(mockWrite).toHaveBeenCalledWith('mycorner.ai-character.v1', 'older-man');
});
it('does not let delayed storage hydration overwrite a newer selection', async () => {
  let resolve!: (value: string) => void;
  mockRead.mockReturnValue(new Promise<string>((done) => { resolve = done; }));
  const preference = load();
  const pending = preference.loadAICharacterPreference();
  preference.selectAICharacter('young-man');
  resolve('older-man');
  await pending;
  expect(preference.useAICharacter().character.id).toBe('young-man');
});
it('falls back safely for invalid values and denied storage', async () => {
  mockRead.mockResolvedValue('unapproved-character');
  const preference = load();
  await preference.loadAICharacterPreference();
  expect(preference.useAICharacter().character.id).toBe('woman-kente');
  mockWrite.mockRejectedValue(new Error('Storage denied'));
  preference.selectAICharacter('woman-purple');
  await Promise.resolve();
  await Promise.resolve();
  expect(preference.useAICharacter().character.id).toBe('woman-purple');
});

import { router, usePathname } from 'expo-router';
import { Pressable, Text } from 'react-native';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { askPromptForPath, loadAskContext } from '@/lib/neighborhood-assistant';
import { tokens } from '@/theme/tokens';
export function AskMyCornerAccess({ home = false, question }: { home?: boolean; question?: string }) {
  const path = usePathname();
  const context = useProtectedResource(loadAskContext);
  if (!context.data || path === '/ask') return null;
  const open = (prompt: string) => router.push({ pathname: '/ask', params: { question: prompt } });
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={home ? 'Ask My Corner, neighborhood assistant' : 'Ask My Corner'}
      focusable
      onPress={() => open(question || askPromptForPath(path))}
      style={{ minHeight: tokens.touch.min, justifyContent: 'center' }}
    >
      <Text style={{ color: tokens.color.textPrimary, fontWeight: '700', fontSize: 16 }}>Ask My Corner</Text>
      {home ? <Text style={{ color: tokens.color.textPrimary }}>Ask anything about your neighborhood.</Text> : null}
    </Pressable>
  );
}

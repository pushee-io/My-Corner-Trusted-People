import { router, usePathname } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { askPromptForPath, loadAskContext } from '@/lib/neighborhood-assistant';
import { tokens } from '@/theme/tokens';
export function AskMyCornerAccess({ home = false, question }: { home?: boolean; question?: string }) {
  const path = usePathname();
  const context = useProtectedResource(loadAskContext);
  if (!context.data || path === '/ask') return null;
  const open = (prompt: string) => router.push({ pathname: '/ask', params: { question: prompt } });
  return (
    <View style={{ gap: 8 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ask My Corner"
        onPress={() => open(question || askPromptForPath(path))}
        style={{ minHeight: 48, justifyContent: 'center' }}
      >
        <Text style={{ color: tokens.color.textPrimary, fontWeight: '700', fontSize: 16 }}>Ask My Corner</Text>
        {home ? <Text style={{ color: tokens.color.textPrimary }}>Ask anything about your neighborhood.</Text> : null}
      </Pressable>
      {home ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {['What’s happening this weekend?', 'Find local help', 'Any important alerts?', 'What did I miss?'].map(
            (prompt) => (
              <Pressable
                key={prompt}
                accessibilityRole="button"
                onPress={() => open(prompt)}
                style={{ minHeight: 48, justifyContent: 'center' }}
              >
                <Text style={{ color: tokens.color.textPrimary }}>{prompt}</Text>
              </Pressable>
            ),
          )}
        </View>
      ) : null}
    </View>
  );
}

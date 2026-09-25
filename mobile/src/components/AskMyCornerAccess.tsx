import { router, usePathname } from 'expo-router';
import { Text, View } from 'react-native';
import { ActionPill } from '@/components/ActionPill';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { loadAskContext } from '@/lib/neighborhood-assistant';
import { tokens } from '@/theme/tokens';
export function AskMyCornerAccess({ home = false, question }: { home?: boolean; question?: string }) {
  const path = usePathname();
  const context = useProtectedResource(loadAskContext);
  if (!context.data || path === '/ask') return null;
  return (
    <View style={{ maxWidth: '100%', flexShrink: 1, gap: tokens.spacing.xs }}>
      <ActionPill
        label="Ask My Corner AI"
        primary
        onPress={() =>
          router.push(question ? { pathname: '/ask', params: { question: question.slice(0, 600) } } : '/ask')
        }
      />
      {home ? <Text style={{ color: tokens.color.textSecondary }}>Ask anything about your neighborhood.</Text> : null}
    </View>
  );
}

import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '@/theme/tokens';

export function Screen({
  title,
  children,
  showTitle = true,
}: PropsWithChildren<{ title: string; showTitle?: boolean }>) {
  const { width } = useWindowDimensions();
  const contentWidth = width >= 840 ? 760 : width >= 600 ? 560 : undefined;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          contentWidth ? { maxWidth: contentWidth, alignSelf: 'center', width: '100%' } : null,
        ]}
      >
        {showTitle ? (
          <Text accessibilityRole="header" style={styles.title}>
            {title}
          </Text>
        ) : null}
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tokens.color.background },
  content: { padding: tokens.spacing.lg, gap: tokens.spacing.lg },
  title: { fontSize: 28, fontWeight: '700', color: tokens.color.textPrimary },
  body: { gap: tokens.spacing.md },
});

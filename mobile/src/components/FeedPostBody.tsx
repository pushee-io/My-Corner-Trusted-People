import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { tokens } from '@/theme/tokens';

/** Collapse long posts visually without cutting their stored or spoken content. */
export function FeedPostBody({ body }: { body: string }) {
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const collapsible = body.length > 240 || body.split('\n').length > 4;
  useEffect(() => setExpanded(false), [body]);
  return (
    <View style={styles.container}>
      <Text style={styles.body} numberOfLines={collapsible && !expanded ? 5 : undefined}>
        {body}
      </Text>
      {collapsible ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? 'Show less of this post' : 'Read full post'}
          accessibilityState={{ expanded }}
          onPress={() => setExpanded((value) => !value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={({ pressed }) => [
            styles.toggle,
            {
              backgroundColor: pressed ? tokens.color.surfacePressed : 'transparent',
              borderColor: focused ? tokens.color.focusRing : 'transparent',
            },
          ]}
        >
          <Text style={styles.label}>{expanded ? 'Show less' : 'Read more'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: tokens.spacing.xs },
  body: { ...tokens.typography.body, color: tokens.color.textPrimary },
  toggle: {
    alignSelf: 'flex-start',
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing.sm,
    borderWidth: 1,
    borderRadius: tokens.radius.control,
  },
  label: { ...tokens.typography.button, color: tokens.color.primary },
});

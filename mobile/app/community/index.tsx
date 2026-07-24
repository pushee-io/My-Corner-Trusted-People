import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { tokens } from '@/theme/tokens';

export default function CommunityScreen() {
  return (
    <Screen title="Community">
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Ordinary posts stay inside your verified neighborhood.
        </Text>
      </View>

      <Link href="/community/new-post" asChild>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Create local post</Text>
        </Pressable>
      </Link>

      <Text style={styles.sectionTitle}>Explore</Text>

      <Link href="/marketplace" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkText}>Marketplace</Text>
        </Pressable>
      </Link>

      <Link href="/recommendations" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkText}>Recommendations</Text>
        </Pressable>
      </Link>

      <Link href="/groups" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkText}>Groups</Text>
        </Pressable>
      </Link>

      <Link href="/agency-broadcasts" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkText}>Agency broadcasts</Text>
        </Pressable>
      </Link>

      <Link href="/messages" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkText}>Messages</Text>
        </Pressable>
      </Link>

      <Link href="/report/evidence" asChild>
        <Pressable style={styles.linkButton}>
          <Text style={styles.linkText}>Report evidence</Text>
        </Pressable>
      </Link>

      <Text style={styles.sectionTitle}>East Legon local posts</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Water pressure around Lagos Avenue</Text>
        <Text style={styles.body}>Has anyone else had low water pressure this morning?</Text>
        <Text style={styles.meta}>Verified neighborhood only</Text>
      </View>

      <Text style={styles.sectionTitle}>Greater Accra feed</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Planned sanitation pickup notice</Text>
        <Text style={styles.body}>Approved agency broadcast for selected Accra neighborhoods.</Text>
        <Text style={styles.meta}>Approved regional content only</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: '#FFF4D6',
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  noticeText: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.support,
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
  },
  sectionTitle: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.card,
    fontWeight: '800',
  },
  linkButton: {
    minHeight: tokens.touch.min,
    justifyContent: 'center',
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.primary,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
  },
  linkText: {
    color: tokens.color.primary,
    textAlign: 'center',
    fontWeight: '700',
  },
  card: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderWidth: 1,
    borderRadius: tokens.radius.md,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.xs,
  },
  cardTitle: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.card,
    fontWeight: '700',
  },
  body: {
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
  },
  meta: {
    color: tokens.color.textSecondary,
    fontSize: tokens.type.support,
  },
});

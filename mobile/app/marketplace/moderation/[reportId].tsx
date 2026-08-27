import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '@/components/Screen';
import { EmptyState, LoadingState } from '@/components/StateBlocks';
import {
  getMarketplaceModerationReport,
  marketplaceModerationReasons,
  reviewMarketplaceReport,
} from '@/lib/marketplace-moderation-repository';
import { tokens } from '@/theme/tokens';
import type {
  MarketplaceModerationDecision,
  MarketplaceModerationReasonCode,
  MarketplaceModerationReport,
} from '@/types/contracts';

const decisions: Array<{ value: MarketplaceModerationDecision; label: string; help: string }> = [
  { value: 'approve', label: 'Approve', help: 'Keep the listing visible and resolve the report.' },
  { value: 'flag', label: 'Flag', help: 'Mark the listing for follow-up and keep the report under review.' },
  { value: 'block', label: 'Block listing', help: 'Hide this listing. This does not ban the seller.' },
];

function actionLabel(action: MarketplaceModerationDecision) {
  return action === 'block' ? 'Block listing' : action === 'flag' ? 'Flag listing' : 'Approve listing';
}

export default function MarketplaceModerationReportScreen() {
  const { reportId } = useLocalSearchParams<{ reportId: string }>();
  const [report, setReport] = useState<MarketplaceModerationReport>();
  const [decision, setDecision] = useState<MarketplaceModerationDecision>();
  const [reasonCode, setReasonCode] = useState<MarketplaceModerationReasonCode>();
  const [reasonDetails, setReasonDetails] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();

  const availableReasons = useMemo(
    () => marketplaceModerationReasons.filter((reason) => decision && reason.decisions.includes(decision)),
    [decision],
  );

  const load = useCallback(async () => {
    if (!reportId) {
      setError('Marketplace report ID is missing.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(undefined);
    try {
      setReport(await getMarketplaceModerationReport(reportId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load this Marketplace report.');
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  function chooseDecision(nextDecision: MarketplaceModerationDecision) {
    setDecision(nextDecision);
    setReasonCode(undefined);
    setConfirming(false);
    setError(undefined);
  }

  async function submitDecision() {
    if (!report || !decision || !reasonCode) {
      setError('Choose an action and reason before continuing.');
      return;
    }
    setIsSubmitting(true);
    setError(undefined);
    try {
      await reviewMarketplaceReport({
        reportId: report.reportId,
        decision,
        reasonCode,
        reasonDetails,
      });
      setNotice(`${actionLabel(decision)} recorded. The audit history has been updated.`);
      setDecision(undefined);
      setReasonCode(undefined);
      setReasonDetails('');
      setConfirming(false);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not record this moderation decision.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Screen title="Marketplace report">
        <LoadingState title="Loading report" />
      </Screen>
    );
  }

  if (!report) {
    return (
      <Screen title="Marketplace report">
        <EmptyState title="Report unavailable" body={error ?? 'This report could not be found.'} />
      </Screen>
    );
  }

  return (
    <Screen title="Review Marketplace report">
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      {notice ? (
        <Text accessibilityRole="alert" style={styles.success}>
          {notice}
        </Text>
      ) : null}

      <View style={styles.section}>
        <View style={styles.headingRow}>
          <Text style={styles.sectionTitle}>Report</Text>
          <Text style={styles.statusText}>{report.reportStatus === 'reviewing' ? 'Under review' : report.reportStatus}</Text>
        </View>
        <Text style={styles.label}>Reason submitted</Text>
        <Text style={styles.body}>{report.reportReason}</Text>
        {report.reportDetails ? <Text style={styles.secondary}>{report.reportDetails}</Text> : null}
        <Text style={styles.meta}>
          Reported by {report.reporterName} on {new Date(report.reportedAt).toLocaleString('en-GH')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Listing evidence</Text>
        {report.imageUrls.length > 0 ? (
          <View style={styles.imageGrid}>
            {report.imageUrls.map((url, index) => (
              <Image accessibilityLabel={`Listing evidence ${index + 1}`} key={url} source={{ uri: url }} style={styles.image} />
            ))}
          </View>
        ) : (
          <Text style={styles.secondary}>No listing images are attached.</Text>
        )}
        <Text style={styles.title}>{report.listingTitle}</Text>
        <Text style={styles.body}>{report.listingDescription}</Text>
        <Text style={styles.meta}>Seller: {report.sellerName}</Text>
        <Text style={styles.meta}>Neighborhood: {report.neighborhoodName}</Text>
        <Text style={styles.meta}>General pickup area: {report.listingPickupArea}</Text>
        <Text style={styles.meta}>Current content status: {report.listingModerationStatus}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Decision</Text>
        <View style={styles.decisionList}>
          {decisions.map((item) => {
            const selected = decision === item.value;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                key={item.value}
                onPress={() => chooseDecision(item.value)}
                style={[styles.decision, selected ? styles.decisionSelected : null]}
              >
                <Text style={[styles.decisionTitle, selected ? styles.decisionTitleSelected : null]}>{item.label}</Text>
                <Text style={[styles.decisionHelp, selected ? styles.decisionHelpSelected : null]}>{item.help}</Text>
              </Pressable>
            );
          })}
        </View>

        {decision ? (
          <View style={styles.reasonList}>
            <Text style={styles.label}>Decision reason</Text>
            {availableReasons.map((reason) => {
              const selected = reasonCode === reason.code;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  key={reason.code}
                  onPress={() => {
                    setReasonCode(reason.code);
                    setConfirming(false);
                    setError(undefined);
                  }}
                  style={[styles.reasonButton, selected ? styles.reasonButtonSelected : null]}
                >
                  <Text style={[styles.reasonButtonText, selected ? styles.reasonButtonTextSelected : null]}>
                    {reason.label}
                  </Text>
                </Pressable>
              );
            })}
            <Text style={styles.label}>Moderator notes (optional)</Text>
            <TextInput
              accessibilityLabel="Moderator notes"
              maxLength={500}
              multiline
              onChangeText={(value) => {
                setReasonDetails(value);
                setConfirming(false);
              }}
              placeholder={reasonCode === 'other' ? 'Required for other policy concerns' : 'Add useful review context'}
              placeholderTextColor={tokens.color.textSecondary}
              style={[styles.input, styles.textArea]}
              value={reasonDetails}
            />
            <Text style={styles.counter}>{reasonDetails.length}/500</Text>
          </View>
        ) : null}

        {decision && reasonCode && !confirming ? (
          <Pressable accessibilityRole="button" onPress={() => setConfirming(true)} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Review decision</Text>
          </Pressable>
        ) : null}

        {confirming && decision && reasonCode ? (
          <View accessible accessibilityLabel="Confirm moderation decision" style={styles.confirmation}>
            <Text style={styles.title}>Confirm {actionLabel(decision).toLowerCase()}</Text>
            <Text style={styles.body}>{availableReasons.find((reason) => reason.code === reasonCode)?.label}</Text>
            {decision === 'block' ? (
              <Text style={styles.warning}>The listing will be hidden immediately. The seller account will not be banned.</Text>
            ) : null}
            <View style={styles.confirmationActions}>
              <Pressable
                accessibilityRole="button"
                disabled={isSubmitting}
                onPress={() => void submitDecision()}
                style={[styles.primaryButton, isSubmitting ? styles.disabled : null]}
              >
                <Text style={styles.primaryButtonText}>{isSubmitting ? 'Saving...' : 'Confirm decision'}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => setConfirming(false)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Go back</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Audit history</Text>
        {report.auditHistory.length === 0 ? (
          <Text style={styles.secondary}>No moderation decisions have been recorded.</Text>
        ) : (
          <View style={styles.history}>
            {report.auditHistory.map((entry) => (
              <View key={entry.id} style={styles.historyItem}>
                <Text style={styles.title}>{actionLabel(entry.action)}</Text>
                <Text style={styles.body}>
                  {entry.previousStatus} to {entry.resultingStatus}
                </Text>
                <Text style={styles.secondary}>{entry.reasonCode.split('_').join(' ')}</Text>
                {entry.reasonDetails ? <Text style={styles.secondary}>{entry.reasonDetails}</Text> : null}
                <Text style={styles.meta}>
                  {entry.actorName} · {new Date(entry.createdAt).toLocaleString('en-GH')}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { color: tokens.color.textPrimary, fontSize: tokens.type.body, lineHeight: 23 },
  confirmation: { backgroundColor: '#FFF4D6', borderRadius: tokens.radius.md, gap: tokens.spacing.md, padding: tokens.spacing.lg },
  confirmationActions: { gap: tokens.spacing.sm },
  counter: { color: tokens.color.textSecondary, fontSize: tokens.type.minimum, textAlign: 'right' },
  decision: {
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    gap: tokens.spacing.xs,
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  decisionHelp: { color: tokens.color.textSecondary, fontSize: tokens.type.support, lineHeight: 20 },
  decisionHelpSelected: { color: '#FFFFFF' },
  decisionList: { gap: tokens.spacing.sm },
  decisionSelected: { backgroundColor: tokens.color.primary, borderColor: tokens.color.primary },
  decisionTitle: { color: tokens.color.textPrimary, fontSize: tokens.type.body, fontWeight: '700' },
  decisionTitleSelected: { color: '#FFFFFF' },
  disabled: { opacity: 0.55 },
  error: { backgroundColor: '#FBE9E5', borderRadius: tokens.radius.md, color: tokens.color.error, padding: tokens.spacing.md },
  headingRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  history: { gap: tokens.spacing.md },
  historyItem: { borderLeftColor: tokens.color.primary, borderLeftWidth: 3, gap: tokens.spacing.xs, paddingLeft: tokens.spacing.md },
  image: { aspectRatio: 1, backgroundColor: tokens.color.border, borderRadius: tokens.radius.md, flexBasis: '47%' },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm },
  input: {
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  label: { color: tokens.color.textPrimary, fontSize: tokens.type.label, fontWeight: '700' },
  meta: { color: tokens.color.textSecondary, fontSize: tokens.type.support, lineHeight: 20 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '700' },
  reasonButton: {
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  reasonButtonSelected: { borderColor: tokens.color.primary, borderWidth: 2 },
  reasonButtonText: { color: tokens.color.textPrimary, fontSize: tokens.type.body },
  reasonButtonTextSelected: { color: tokens.color.primary, fontWeight: '700' },
  reasonList: { gap: tokens.spacing.sm },
  secondary: { color: tokens.color.textSecondary, fontSize: tokens.type.support, lineHeight: 20 },
  secondaryButton: {
    alignItems: 'center',
    borderColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  secondaryButtonText: { color: tokens.color.primary, fontWeight: '700' },
  section: { borderBottomColor: tokens.color.border, borderBottomWidth: 1, gap: tokens.spacing.md, paddingBottom: tokens.spacing.xl },
  sectionTitle: { color: tokens.color.textPrimary, fontSize: tokens.type.section, fontWeight: '700' },
  statusText: { color: tokens.color.primary, fontSize: tokens.type.label, fontWeight: '700', textTransform: 'capitalize' },
  success: { backgroundColor: '#E7F6EE', borderRadius: tokens.radius.md, color: tokens.color.textPrimary, padding: tokens.spacing.md },
  textArea: { minHeight: 112, textAlignVertical: 'top' },
  title: { color: tokens.color.textPrimary, fontSize: tokens.type.card, fontWeight: '700' },
  warning: { color: tokens.color.error, fontSize: tokens.type.support, fontWeight: '700', lineHeight: 20 },
});

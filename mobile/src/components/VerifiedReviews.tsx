import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { router } from 'expo-router';
import { Text, TextInput, View } from 'react-native';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { loadReputation, loadReviewJob, reviewApi, type Review } from '@/lib/reviews';
import { mediaSessionRevision, subscribeMediaSession } from '@/lib/media-session';
import { ReportButton, reportStyles as styles } from './JobReportParts';

export function ReviewPrompt({ requestId }: { requestId: string }) {
  const resource = useProtectedResource(
    useCallback(() => loadReviewJob(requestId), [requestId]),
    10000,
  );
  const context = resource.data;
  useEffect(() => {
    if (context?.canReview) void reviewApi('event', requestId, { event: 'review_prompt_viewed' }).catch(() => {});
  }, [context?.canReview, requestId]);
  if (!context) return resource.error ? <Text style={styles.note}>{resource.error}</Text> : null;
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>
        {context.completed
          ? `Your job with ${context.providerName} is complete.`
          : 'Complete the Job Safety confirmations to leave a verified review.'}
      </Text>
      {context.canReview || context.canEdit ? (
        <ReportButton
          label={context.canEdit ? 'Edit your review' : 'Review your provider'}
          onPress={() => router.push({ pathname: '/reviews/write', params: { requestId } })}
        />
      ) : context.review ? (
        <Text style={styles.body}>
          Review{' '}
          {context.review.status === 'clean'
            ? 'published'
            : context.review.status === 'blocked'
              ? 'removed'
              : 'under review'}
          .
        </Text>
      ) : null}
    </View>
  );
}

function ReviewActions({ review, reload }: { review: Review; reload: () => void }) {
  const [mode, setMode] = useState<'reply' | 'report'>();
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  async function send() {
    if (!mode || busy) return;
    setBusy(true);
    setNotice('');
    try {
      await reviewApi(mode, review.id, mode === 'reply' ? { body } : { reason: body });
      setBody('');
      setMode(undefined);
      setNotice(
        mode === 'reply'
          ? 'Response saved. Content may require moderation before it appears.'
          : 'Report received for moderator review.',
      );
      reload();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not save. Please retry.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={{ gap: 8 }}>
      {review.canRespond ? (
        <ReportButton
          label="Respond to this review"
          onPress={() => {
            setMode('reply');
            setBody('');
          }}
        />
      ) : null}
      <ReportButton
        label="Report review or response"
        onPress={() => {
          setMode('report');
          setBody('');
        }}
      />
      {mode ? (
        <>
          <TextInput
            accessibilityLabel={mode === 'reply' ? 'Provider response' : 'Report reason'}
            multiline
            maxLength={mode === 'reply' ? 1000 : 500}
            value={body}
            onChangeText={setBody}
            style={styles.input}
            placeholder={
              mode === 'reply'
                ? 'Write a respectful response'
                : 'Explain the concern, including whether it concerns the response'
            }
          />
          <ReportButton
            label={busy ? 'Saving…' : mode === 'reply' ? 'Submit response' : 'Submit report'}
            disabled={busy || !body.trim()}
            onPress={() => void send()}
          />
          <ReportButton
            label="Cancel"
            disabled={busy}
            onPress={() => {
              setMode(undefined);
              setBody('');
            }}
          />
        </>
      ) : null}
      {notice ? (
        <Text accessibilityLiveRegion="polite" style={styles.note}>
          {notice}
        </Text>
      ) : null}
    </View>
  );
}

export function VerifiedReviews({ providerId }: { providerId: string }) {
  const resource = useProtectedResource(
    useCallback(() => loadReputation(providerId), [providerId]),
    10000,
  );
  const revision = useSyncExternalStore(subscribeMediaSession, mediaSessionRevision, mediaSessionRevision);
  const data = resource.data;
  return (
    <View style={styles.panel}>
      <Text style={styles.title}>Verified job reviews</Text>
      {resource.error ? (
        <>
          <Text style={styles.note}>{resource.error}</Text>
          <ReportButton label="Retry reviews" onPress={() => void resource.refresh()} />
        </>
      ) : null}
      {resource.loading ? <Text style={styles.body}>Loading reviews…</Text> : null}
      {data ? (
        <>
          <Text style={styles.body}>
            {data.count
              ? `${data.average.toFixed(1)} out of 5 · ${data.count} verified reviews`
              : 'No verified reviews yet'}
          </Text>
          <Text style={styles.note}>{data.completedJobs} completed My Corner jobs</Text>
          {data.recommendationPercent !== null ? (
            <Text style={styles.note}>{data.recommendationPercent}% would recommend</Text>
          ) : null}
          {data.reviews.map((review) => (
            <View key={review.id} style={styles.panel}>
              <Text style={styles.title}>{review.title}</Text>
              <Text accessibilityLabel={`${review.rating} out of 5 stars`} style={styles.body}>
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)} · {review.rating}/5
              </Text>
              <Text style={styles.note}>
                Verified Job · {review.author} · {new Date(review.createdAt).toLocaleDateString()}
              </Text>
              <Text style={styles.body}>{review.body}</Text>
              <Text style={styles.note}>
                {review.recommends ? 'Would recommend to a neighbor' : 'Would not recommend'}
              </Text>
              {review.response ? (
                <View style={styles.panel}>
                  <Text style={styles.title}>Provider response</Text>
                  <Text style={styles.body}>{review.response}</Text>
                </View>
              ) : null}
              <ReviewActions key={`${revision}-${review.id}`} review={review} reload={() => void resource.refresh()} />
            </View>
          ))}
        </>
      ) : null}
    </View>
  );
}

export function ProviderReputationSummary({ providerId }: { providerId: string }) {
  const resource = useProtectedResource(useCallback(() => loadReputation(providerId), [providerId]));
  const data = resource.data;
  return (
    <View>
      <Text style={styles.note}>
        {data
          ? data.count
            ? `${data.average.toFixed(1)} / 5 · ${data.count} verified reviews`
            : 'No verified reviews yet'
          : resource.error
            ? 'Verified reviews unavailable'
            : 'Loading verified reviews…'}
      </Text>
      {data ? <Text style={styles.note}>{data.completedJobs} completed My Corner jobs</Text> : null}
    </View>
  );
}

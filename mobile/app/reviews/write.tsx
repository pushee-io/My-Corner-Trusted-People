import { useLocalSearchParams, router } from 'expo-router';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { ReportButton, reportStyles as styles } from '@/components/JobReportParts';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { loadReviewJob, reviewApi, submitReview, type ReviewJob } from '@/lib/reviews';
import { mediaSessionRevision, subscribeMediaSession } from '@/lib/media-session';

function Editor({ requestId, context }: { requestId: string; context: ReviewJob }) {
  const [rating, setRating] = useState(context.review?.rating ?? 0);
  const [title, setTitle] = useState(context.review?.title ?? '');
  const [body, setBody] = useState(context.review?.body ?? '');
  const [recommends, setRecommends] = useState<boolean | null>(context.review?.recommends ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  useEffect(() => {
    void reviewApi('event', requestId, { event: 'review_started' }).catch(() => {});
  }, [requestId]);
  async function save() {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await submitReview(requestId, { rating, title, body, recommends, edit: context.canEdit });
      setSaved(result.status);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save your review. Please retry.');
    } finally {
      setBusy(false);
    }
  }
  if (saved)
    return (
      <View style={styles.panel}>
        <Text style={styles.title}>
          {saved === 'clean'
            ? 'Thanks for helping neighbors make informed decisions.'
            : 'Your review is saved for moderation.'}
        </Text>
        <ReportButton
          label="View provider reviews"
          onPress={() =>
            router.replace({ pathname: '/hire/provider/[providerId]', params: { providerId: context.providerId } })
          }
        />
        <ReportButton
          label="Done"
          onPress={() =>
            router.canGoBack()
              ? router.back()
              : router.replace({ pathname: '/hire/request/safety-session', params: { requestId } })
          }
        />
      </View>
    );
  return (
    <View style={{ gap: 16 }}>
      <Text style={styles.title}>How was your experience with {context.providerName}?</Text>
      <Text style={styles.body}>Share your experience to help neighbors make informed decisions.</Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Overall rating"
        style={{ flexDirection: 'row', flexWrap: 'wrap' }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            accessibilityRole="radio"
            accessibilityLabel={`${star} out of 5 stars`}
            accessibilityState={{ checked: rating === star }}
            onPress={() => setRating(star)}
            style={{ minWidth: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 30 }}>{star <= rating ? '★' : '☆'}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.body}>{rating ? `${rating} out of 5 stars` : 'Choose 1–5 stars'}</Text>
      <TextInput
        accessibilityLabel="Review title"
        placeholder="Review title"
        maxLength={100}
        value={title}
        onChangeText={setTitle}
        style={[styles.input, { minHeight: 48 }]}
      />
      <Text style={styles.note}>
        How was their conduct and communication? Did they arrive as expected? How satisfied were you with the work? Were
        they respectful and professional?
      </Text>
      <TextInput
        accessibilityLabel="Written review"
        placeholder="Focus on the work, communication and conduct you personally experienced."
        multiline
        maxLength={2000}
        value={body}
        onChangeText={setBody}
        style={styles.input}
      />
      <Text style={styles.body}>Would you recommend {context.providerName} to a neighbor?</Text>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Recommendation"
        style={{ flexDirection: 'row', gap: 16 }}
      >
        {[true, false].map((value) => (
          <Pressable
            key={String(value)}
            accessibilityRole="radio"
            accessibilityState={{ checked: recommends === value }}
            onPress={() => setRecommends(value)}
            style={{ minWidth: 80, minHeight: 48, justifyContent: 'center' }}
          >
            <Text style={styles.body}>
              {recommends === value ? '◉' : '○'} {value ? 'Yes' : 'No'}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.note}>
        Do not include phone numbers, private addresses or other personal information. You can edit for seven days,
        until a provider responds or moderation restricts changes.
      </Text>
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <ReportButton
        label={busy ? 'Saving…' : context.canEdit ? 'Save review changes' : 'Submit review'}
        disabled={busy}
        onPress={() => void save()}
      />
    </View>
  );
}
export default function ReviewScreen() {
  const { requestId } = useLocalSearchParams<{ requestId?: string }>();
  const revision = useSyncExternalStore(subscribeMediaSession, mediaSessionRevision, mediaSessionRevision);
  const resource = useProtectedResource(
    useCallback(async () => {
      if (!requestId) throw new Error('Choose a completed job.');
      return loadReviewJob(requestId);
    }, [requestId]),
  );
  return (
    <Screen title="Review your provider">
      {resource.loading ? <Text style={styles.body}>Checking review eligibility…</Text> : null}
      {resource.error ? (
        <>
          <Text style={styles.error}>{resource.error}</Text>
          <ReportButton label="Retry" onPress={() => void resource.refresh()} />
        </>
      ) : null}
      {requestId && resource.data ? (
        resource.data.canReview || resource.data.canEdit ? (
          <Editor key={`${requestId}-${revision}`} requestId={requestId} context={resource.data} />
        ) : resource.data.review ? (
          <View style={styles.panel}>
            <Text style={styles.title}>Your review of {resource.data.providerName}</Text>
            <Text accessibilityLabel={`${resource.data.review.rating} out of 5 stars`} style={styles.body}>
              {'★'.repeat(resource.data.review.rating)}
              {'☆'.repeat(5 - resource.data.review.rating)}
            </Text>
            <Text style={styles.title}>{resource.data.review.title}</Text>
            <Text style={styles.body}>{resource.data.review.body}</Text>
            <Text style={styles.note}>
              Would recommend to a neighbor: {resource.data.review.recommends ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.note}>Review status: {resource.data.review.status}</Text>
          </View>
        ) : (
          <Text style={styles.body}>
            This job is not currently eligible for a new or edited review. Both Job Safety completion confirmations are
            required, and each job can have one review.
          </Text>
        )
      ) : null}
    </Screen>
  );
}

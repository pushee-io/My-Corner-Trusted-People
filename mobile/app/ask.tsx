import { loadAskQuota, quotaMessage } from '@/lib/ask-quota';
import { router, useFocusEffect, useLocalSearchParams, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { IconButton } from '@/components/IconButton';
import { AICharacterExperience } from '@/components/AICharacterExperience';
import { useAICharacter } from '@/hooks/useAICharacter';
import { ActionPill } from '@/components/ActionPill';
import { Screen } from '@/components/Screen';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { subscribeMediaSession } from '@/lib/media-session';
import {
  askFeedback,
  followupProvider,
  askNeighborhood,
  askSourceClick,
  askUnavailable,
  askErrorMessage,
  loadAskContext,
  reviewCountLabel,
  safeAskHref,
  type AskAnswer,
  type AskSource,
} from '@/lib/neighborhood-assistant';
import { tokens } from '@/theme/tokens';
const sourceAction = {
  event: 'View event / RSVP',
  provider: 'View provider',
  agency: 'View broadcast',
  post: 'View post',
  group: 'Open group discussion',
  marketplace: 'View listing / Contact seller',
};
const date = (value: string) =>
  new Date(value).toLocaleString('en-GH', { timeZone: 'Africa/Accra', dateStyle: 'medium', timeStyle: 'short' });
export default function AskScreen() {
  const params = useLocalSearchParams<{ question?: string; fromHome?: string; submission?: string }>();
  const composer = useRef<TextInput>(null);
  const { character, selectCharacter } = useAICharacter();
  const homeQuestion = useRef<string | undefined>(undefined);
  const observedHomeHandoff = useRef<string | undefined>(undefined);
  const handoff =
    params.fromHome === '1' && typeof params.question === 'string'
      ? `${params.submission ?? ''}:${params.question}`
      : undefined;
  // Route params can arrive after the first native render. Observe each handoff
  // once, instead of capturing only the initial render's often-empty params.
  useEffect(() => {
    if (handoff && observedHomeHandoff.current !== handoff) {
      observedHomeHandoff.current = handoff;
      homeQuestion.current = params.question?.slice(0, 600).trim();
    }
  }, [handoff, params.question]);
  const quota = useProtectedResource(loadAskQuota, 15000);
  const context = useProtectedResource(loadAskContext, 30000);
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [answer, setAnswer] = useState<AskAnswer>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [feedback, setFeedback] = useState<string>();
  const [showAll, setShowAll] = useState(false);
  const generation = useRef(0);
  const sending = useRef(false);
  const [searchSuggestion, setSearchSuggestion] = useState(
    params.fromHome !== '1' && typeof params.question === 'string' ? params.question.slice(0, 600).trim() : '',
  );
  const clear = useCallback(() => {
    homeQuestion.current = undefined;
    generation.current += 1;
    sending.current = false;
    setSearchSuggestion('');
    setAnswer(undefined);
    setHistory([]);
    setQuestion('');
    setFeedback(undefined);
    setError(undefined);
    setBusy(false);
  }, []);
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = subscribeMediaSession(clear);
      const sub = AppState.addEventListener('change', (state) => {
        if (state !== 'active') clear();
      });
      return () => {
        unsubscribe();
        sub.remove();
        clear();
      };
    }, [clear]),
  );
  const neighborhood = context.data?.id;
  useEffect(() => {
    if (!context.loading && !neighborhood) clear();
  }, [context.loading, neighborhood, clear]);
  const previousNeighborhood = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (previousNeighborhood.current && neighborhood && neighborhood !== previousNeighborhood.current) clear();
    if (neighborhood) previousNeighborhood.current = neighborhood;
  }, [neighborhood, clear]);
  const quotaReset = quota.data?.blocked_scope ? quota.data.retry_at : quota.data?.reset_at;
  const refreshQuota = quota.refresh;
  useEffect(() => {
    const reset = quotaReset;
    if (!reset) return;
    const delay = Date.parse(reset) - Date.now();
    if (delay < 0) return;
    const timer = setTimeout(() => void refreshQuota(), Math.min(delay + 500, 2147483647));
    return () => clearTimeout(timer);
  }, [quotaReset, refreshQuota]);
  async function ask(value = question, selectedProviderId?: string) {
    if (!neighborhood || sending.current || value.trim().length < 3) return;
    composer.current?.blur();
    Keyboard.dismiss();
    sending.current = true;
    const current = ++generation.current;
    const submitted = value.trim();
    setQuestion('');
    setSearchSuggestion('');
    setHistory([...history, submitted].slice(-2));
    setBusy(true);
    setError(undefined);
    setFeedback(undefined);
    setAnswer(undefined);
    setShowAll(false);
    try {
      const selected =
        selectedProviderId ??
        (/\b(he|she|they|this provider|that provider)\b/i.test(submitted) ? followupProvider(answer) : undefined);
      const next = selected
        ? await askNeighborhood(submitted, history, neighborhood, selected)
        : await askNeighborhood(submitted, history, neighborhood);
      if (generation.current !== current) return;
      setAnswer(next);
    } catch (error) {
      if (generation.current === current) setError(askErrorMessage(error));
    } finally {
      if (generation.current === current) {
        void quota.refresh();
        sending.current = false;
        setBusy(false);
      }
    }
  }
  // Home's send action hands off once to this existing quota-checked request path.
  useEffect(() => {
    if (!neighborhood || busy || !homeQuestion.current) return;
    const pending = homeQuestion.current;
    homeQuestion.current = undefined;
    void ask(pending);
  });
  async function open(source: AskSource, request = false) {
    if (!answer) return;
    const current = generation.current;
    try {
      await askSourceClick(answer.id, source);
      if (current !== generation.current) return;
      if (request) router.push({ pathname: '/hire/request/new', params: { providerId: source.id } });
      else router.push(safeAskHref(source) as Href);
    } catch (e) {
      if (current === generation.current) setError(e instanceof Error ? e.message : askUnavailable);
    }
  }
  async function rate(value: 'helpful' | 'not_helpful' | 'inaccurate') {
    if (!answer) return;
    const current = generation.current;
    try {
      await askFeedback(answer.id, value);
      if (current === generation.current) setFeedback('Thanks. Your feedback was saved.');
    } catch (e) {
      if (current === generation.current) setFeedback(e instanceof Error ? e.message : 'Please try again.');
    }
  }
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen title="Ask My Corner AI">
        <AICharacterExperience
          character={character}
          selectCharacter={selectCharacter}
          state={busy ? 'thinking' : error ? 'attention' : answer ? 'answer' : 'idle'}
        />
        {context.data ? (
          <Text style={styles.meta}>{context.data.name} · Neighborhood context</Text>
        ) : (
          <Text style={styles.body}>{context.loading ? 'Checking neighborhood access…' : askUnavailable}</Text>
        )}
        {history.map((submitted, index) => (
          <Text key={`${index}:${submitted}`} style={styles.body}>
            You: {submitted}
          </Text>
        ))}
        {searchSuggestion ? (
          <ActionPill
            label={`Ask about: ${searchSuggestion}`}
            disabled={!neighborhood || busy}
            onPress={() => void ask(searchSuggestion)}
          />
        ) : null}
        {quota.data ? (
          <Text accessibilityLiveRegion="polite" style={styles.meta}>
            {quotaMessage(quota.data)}
          </Text>
        ) : null}
        <View style={styles.composer}>
          <TextInput
            ref={composer}
            accessibilityLabel="Neighborhood question"
            placeholder="Ask anything about your neighborhood..."
            placeholderTextColor={tokens.color.textSecondary}
            textAlignVertical="top"
            scrollEnabled
            value={question}
            onChangeText={setQuestion}
            multiline
            maxLength={600}
            editable={!busy}
            style={styles.input}
          />
          <IconButton
            icon="arrow-up"
            label={busy ? 'Checking neighborhood sources…' : 'Send question'}
            disabled={!neighborhood || busy || question.trim().length < 3}
            onPress={() => void ask()}
          />
        </View>
        {busy ? (
          <Text accessibilityLiveRegion="polite" style={styles.meta}>
            My Corner AI is checking your neighborhood...
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            composer.current?.blur();
            Keyboard.dismiss();
            router.push({ pathname: '/search', params: { query: question || history.at(-1) || '' } });
          }}
          style={styles.button}
        >
          <Text style={styles.body}>Search your neighborhood</Text>
        </Pressable>
        {error ? (
          <View style={styles.card}>
            <Text accessibilityRole="alert" style={styles.body}>
              {error}
            </Text>
            {history.at(-1) ? (
              <ActionPill
                label="Retry question"
                disabled={!neighborhood || busy}
                onPress={() => void ask(history.at(-1)!)}
              />
            ) : null}
          </View>
        ) : null}
        {answer ? (
          <View style={styles.section}>
            <Text accessibilityLiveRegion="polite" style={styles.body}>
              {answer.notice}
            </Text>
            {answer.clarification?.map((choice) => (
              <ActionPill key={choice} label={choice} disabled={busy} onPress={() => void ask(choice)} />
            ))}
            <Text style={styles.meta}>Checked {date(answer.generatedAt)} · Accra time</Text>
            {answer.sources.length ? (
              <Text accessibilityRole="header" style={styles.title}>
                From My Corner
              </Text>
            ) : null}
            {answer.sources.slice(0, showAll ? 16 : 6).map((source, index) => (
              <View key={`${source.kind}:${source.id}`} style={styles.card}>
                <Text style={styles.meta}>{source.authority}</Text>
                <Text style={styles.title}>{source.title}</Text>
                <Text style={styles.meta}>Posted / updated {date(source.publishedAt)}</Text>
                {source.startsAt ? <Text style={styles.body}>{date(source.startsAt)} · Accra time</Text> : null}
                {source.expiresAt ? <Text style={styles.meta}>Notice expires {date(source.expiresAt)}</Text> : null}
                {source.organizer ? <Text style={styles.body}>Organizer: {source.organizer}</Text> : null}
                <Text style={styles.body}>
                  “{answer.excerpts.find((e) => e.index === index)?.quote ?? source.text.slice(0, 500)}”
                </Text>
                {source.reputation ? (
                  <Text style={styles.body}>
                    {source.reputation.count
                      ? `${source.reputation.average.toFixed(1)} / 5 · ${reviewCountLabel(source.reputation.verifiedCount)}`
                      : 'No verified reviews yet.'}
                  </Text>
                ) : null}
                {source.reputation?.completedJobs !== undefined ? (
                  <Text style={styles.meta}>{source.reputation.completedJobs} confirmed completed My Corner jobs</Text>
                ) : null}
                {source.availability ? (
                  <Text style={styles.meta}>Provider-stated availability: {source.availability}</Text>
                ) : null}
                {source.priceGhs !== undefined ? <Text style={styles.body}>GHS {source.priceGhs}</Text> : null}
                <Pressable accessibilityRole="button" onPress={() => void open(source)} style={styles.button}>
                  <Text style={styles.body}>{sourceAction[source.kind]}</Text>
                </Pressable>
                {source.kind === 'provider' ? (
                  <ActionPill
                    label={`Ask about ${source.title}'s availability`}
                    disabled={busy}
                    onPress={() => void ask('Is this provider available today?', source.id)}
                  />
                ) : null}
                {source.kind === 'provider' ? (
                  <Pressable accessibilityRole="button" onPress={() => void open(source, true)} style={styles.button}>
                    <Text style={styles.body}>Request help</Text>
                  </Pressable>
                ) : null}
              </View>
            ))}
            {!showAll && answer.sources.length > 6 ? (
              <Pressable accessibilityRole="button" onPress={() => setShowAll(true)} style={styles.button}>
                <Text style={styles.body}>See all {answer.sources.length} sources</Text>
              </Pressable>
            ) : null}
            <View style={styles.row}>
              {(['helpful', 'not_helpful', 'inaccurate'] as const).map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  style={styles.button}
                  onPress={() => void rate(value)}
                >
                  <Text style={styles.body}>
                    {value === 'helpful'
                      ? 'Helpful'
                      : value === 'not_helpful'
                        ? 'Not helpful'
                        : 'Report inaccurate answer'}
                  </Text>
                </Pressable>
              ))}
            </View>
            {feedback ? (
              <Text accessibilityLiveRegion="polite" style={styles.body}>
                {feedback}
              </Text>
            ) : null}
            <Pressable accessibilityRole="button" style={styles.button} onPress={clear}>
              <Text style={styles.body}>Start a new question</Text>
            </Pressable>
          </View>
        ) : null}
      </Screen>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  body: { color: tokens.color.textPrimary, fontSize: 16, lineHeight: 24 },
  meta: { color: tokens.color.textPrimary, fontSize: 13, lineHeight: 20 },
  title: { color: tokens.color.textPrimary, fontSize: 19, fontWeight: '700' },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderWidth: 1,
    borderColor: tokens.color.controlBorder,
    borderRadius: 12,
    backgroundColor: tokens.color.surface,
    paddingRight: 4,
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 56,
    maxHeight: 144,
    padding: 12,
    color: tokens.color.textPrimary,
    fontSize: 16,
    backgroundColor: tokens.color.surface,
  },
  button: {
    minHeight: 48,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: tokens.color.border,
    justifyContent: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.color.border,
    backgroundColor: tokens.color.surface,
    gap: 10,
  },
  section: { gap: 16 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});

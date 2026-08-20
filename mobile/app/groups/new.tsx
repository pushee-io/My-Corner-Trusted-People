import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { getGroupCreationRepository } from '@/lib/group-creation-repository';
import { tokens } from '@/theme/tokens';
import type { SocialGroupVisibility } from '@/types/day3';

export default function CreateGroupScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<SocialGroupVisibility>('verified_neighborhood_members');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const disabled = submitting || name.trim().length < 3 || !description.trim();

  async function submit() {
    setError(undefined);
    setSubmitting(true);

    try {
      await getGroupCreationRepository().createGroup({ name, description, visibility });
      router.replace('/groups');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create the group.');
      setSubmitting(false);
    }
  }

  return (
    <Screen title="Create group">
      <Text style={styles.intro}>Start a useful group for verified neighbors. You will become the group owner.</Text>

      <Text style={styles.label}>Group name</Text>
      <TextInput
        accessibilityLabel="Group name"
        maxLength={80}
        onChangeText={setName}
        placeholder="Example: East Legon runners"
        style={styles.input}
        value={name}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        accessibilityLabel="Group description"
        maxLength={500}
        multiline
        onChangeText={setDescription}
        placeholder="Explain the purpose of this group."
        style={[styles.input, styles.textArea]}
        textAlignVertical="top"
        value={description}
      />
      <Text style={styles.counter}>{description.length}/500</Text>

      <Text style={styles.label}>Who can discover this group?</Text>
      <View accessibilityLabel="Group visibility" style={styles.options}>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: visibility === 'verified_neighborhood_members' }}
          onPress={() => setVisibility('verified_neighborhood_members')}
          style={[styles.option, visibility === 'verified_neighborhood_members' ? styles.selected : null]}
        >
          <Text style={visibility === 'verified_neighborhood_members' ? styles.selectedText : styles.optionText}>
            Verified neighborhood
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="radio"
          accessibilityState={{ checked: visibility === 'immediate_cluster_members' }}
          onPress={() => setVisibility('immediate_cluster_members')}
          style={[styles.option, visibility === 'immediate_cluster_members' ? styles.selected : null]}
        >
          <Text style={visibility === 'immediate_cluster_members' ? styles.selectedText : styles.optionText}>
            Nearby neighborhoods
          </Text>
        </Pressable>
      </View>

      <View style={styles.safety}>
        <Text style={styles.safetyText}>
          Do not include exact home addresses, private contact details, or children's personal information.
        </Text>
      </View>

      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={() => void submit()}
        style={[styles.button, disabled ? styles.disabled : null]}
      >
        <Text style={styles.buttonText}>{submitting ? 'Creating group...' : 'Create group'}</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: tokens.color.primary,
    borderRadius: tokens.radius.md,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    padding: tokens.spacing.lg,
  },
  buttonText: { color: '#FFFFFF', fontWeight: '700', textAlign: 'center' },
  counter: { color: tokens.color.textSecondary, fontSize: tokens.type.minimum, textAlign: 'right' },
  disabled: { opacity: 0.5 },
  error: { color: tokens.color.error, fontSize: tokens.type.support, fontWeight: '700' },
  input: {
    backgroundColor: tokens.color.surface,
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    color: tokens.color.textPrimary,
    fontSize: tokens.type.body,
    minHeight: tokens.touch.min,
    padding: tokens.spacing.md,
  },
  intro: { color: tokens.color.textSecondary, fontSize: tokens.type.body },
  label: { color: tokens.color.textPrimary, fontSize: tokens.type.label, fontWeight: '700' },
  option: {
    borderColor: tokens.color.border,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: tokens.touch.min,
    paddingHorizontal: tokens.spacing.md,
  },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: tokens.spacing.sm },
  optionText: { color: tokens.color.textPrimary, fontWeight: '700' },
  safety: { backgroundColor: '#FFF4D6', borderRadius: tokens.radius.md, padding: tokens.spacing.md },
  safetyText: { color: tokens.color.textPrimary, fontSize: tokens.type.support },
  selected: { backgroundColor: tokens.color.primary, borderColor: tokens.color.primary },
  selectedText: { color: '#FFFFFF', fontWeight: '700' },
  textArea: { minHeight: 112 },
});

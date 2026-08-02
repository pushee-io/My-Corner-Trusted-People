import { Redirect, Stack } from 'expo-router';
import { useEventsFeatureFlag } from '@/lib/events-feature';
import { ActivityIndicator, View } from 'react-native';

export default function EventsLayout() {
  const { enabled, loading } = useEventsFeatureFlag();
  if (loading)
    return (
      <View
        accessibilityLabel="Checking Events availability"
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <ActivityIndicator accessibilityRole="progressbar" />
      </View>
    );
  if (!enabled) return <Redirect href="/home" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}

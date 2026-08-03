import { Redirect, Stack } from 'expo-router';
import { isEventsClientEnabled } from '@/lib/events-feature';

export default function EventsLayout() {
  if (!isEventsClientEnabled()) return <Redirect href="/home" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}

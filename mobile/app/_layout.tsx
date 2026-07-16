import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initMonitoring } from '@/lib/sentry';

export default function Layout() {
  useEffect(() => {
    initMonitoring();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}

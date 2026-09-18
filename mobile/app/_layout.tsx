import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initMonitoring } from '@/lib/sentry';
import { supabase } from '@/lib/supabase';
import { invalidateMediaSession } from '@/lib/media-session';

export default function Layout() {
  useEffect(() => {
    initMonitoring();
    let userId: string | undefined;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const nextId = session?.user.id;
      if (event === 'SIGNED_OUT' || (userId !== undefined && nextId !== userId)) invalidateMediaSession();
      userId = nextId;
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}

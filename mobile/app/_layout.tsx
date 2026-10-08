import { tokens } from '@/theme/tokens';
import { forgetEndedSession } from '@/lib/auth';
import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { initMonitoring } from '@/lib/sentry';
import { supabase } from '@/lib/supabase';
import { invalidateMediaSession } from '@/lib/media-session';

export default function Layout() {
  useEffect(() => {
    initMonitoring();
    let redirect: ReturnType<typeof setTimeout> | undefined;
    let userId: string | undefined;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const nextId = session?.user.id;
      clearTimeout(redirect);
      if (event === 'SIGNED_OUT') {
        void forgetEndedSession().catch(() => undefined);
        redirect = setTimeout(() => router.replace('/'), 0);
      } else if (userId !== undefined && nextId !== userId) invalidateMediaSession();
      userId = nextId;
    });
    return () => {
      clearTimeout(redirect);
      data.subscription.unsubscribe();
    };
  }, []);

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: tokens.color.background } }} />;
}

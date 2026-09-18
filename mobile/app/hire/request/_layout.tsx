import { Stack, useGlobalSearchParams, usePathname } from 'expo-router';
import { RequestMediaProvider } from '@/components/media/RequestMediaProvider';

export default function RequestLayout() {
  const pathname = usePathname();
  const params = useGlobalSearchParams<{ providerId?: string | string[] }>();
  const providerId = Array.isArray(params.providerId) ? params.providerId[0] : params.providerId;
  const composing = pathname === '/hire/request/new' || pathname === '/hire/request/review';
  return (
    <RequestMediaProvider scope={composing ? (providerId ?? 'prov-01') : null}>
      <Stack screenOptions={{ headerShown: false }} />
    </RequestMediaProvider>
  );
}

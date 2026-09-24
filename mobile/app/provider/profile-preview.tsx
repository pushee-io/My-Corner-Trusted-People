import { Redirect } from 'expo-router';
import { Text } from 'react-native';
import { Screen } from '@/components/Screen';
import { ReportButton } from '@/components/JobReportParts';
import { useProtectedResource } from '@/hooks/useProtectedResource';
import { getCurrentProviderProfileId } from '@/lib/auth';

export default function ProviderProfilePreviewScreen() {
  const resource = useProtectedResource(getCurrentProviderProfileId);
  if (resource.data)
    return <Redirect href={{ pathname: '/hire/provider/[providerId]', params: { providerId: resource.data } }} />;
  return (
    <Screen title="Profile preview">
      <Text>{resource.error || 'Loading your provider profile…'}</Text>
      {resource.error ? <ReportButton label="Retry profile" onPress={() => void resource.refresh()} /> : null}
    </Screen>
  );
}

import { useLocalSearchParams } from 'expo-router';
import { LoadingView } from '@/components/ui/loading';
import { PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';

export default function PlaceholderScreen() {
  const { index } = useLocalSearchParams<{ index: string }>();
  return (
    <Screen scroll>
      <PageHeader title={`Kisah Nabi ${index}`} subtitle="Sedang disiapkan..." />
      <LoadingView label="Fitur ini sedang dibangun" />
    </Screen>
  );
}

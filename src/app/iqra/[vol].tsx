import { useLocalSearchParams } from 'expo-router';
import { LoadingView } from '@/components/ui/loading';
import { PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';

export default function PlaceholderScreen() {
  const { vol } = useLocalSearchParams<{ vol: string }>();
  return (
    <Screen scroll>
      <PageHeader title={`Iqra Jilid ${vol}`} subtitle="Sedang disiapkan..." />
      <LoadingView label="Fitur ini sedang dibangun" />
    </Screen>
  );
}

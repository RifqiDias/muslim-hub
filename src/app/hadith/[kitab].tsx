import { useLocalSearchParams } from 'expo-router';
import { LoadingView } from '@/components/ui/loading';
import { PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';

export default function PlaceholderScreen() {
  const { kitab } = useLocalSearchParams<{ kitab: string }>();
  return (
    <Screen scroll>
      <PageHeader title={kitab ?? 'Hadits'} subtitle="Sedang disiapkan..." />
      <LoadingView label="Fitur ini sedang dibangun" />
    </Screen>
  );
}

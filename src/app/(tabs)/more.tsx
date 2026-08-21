import { LoadingView } from '@/components/ui/loading';
import { PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';

export default function PlaceholderScreen() {
  return (
    <Screen scroll>
      <PageHeader back={false} title="Lainnya" subtitle="Semua fitur Muslim Hub" />
      <LoadingView label="Fitur ini sedang dibangun" />
    </Screen>
  );
}

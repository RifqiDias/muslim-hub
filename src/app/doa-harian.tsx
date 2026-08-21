import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArabicText } from '@/components/ui/arabic-text';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import { SearchBar } from '@/components/ui/search-bar';
import { SkeletonList } from '@/components/ui/skeleton';
import { getDoaHarian } from '@/lib/api';
import { colors, font, radius, spacing, typography } from '@/theme';

export default function DoaHarianScreen() {
  const [query, setQuery] = useState('');

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['doa-harian'],
    queryFn: getDoaHarian,
  });

  const items = useMemo(() => {
    const all = data ?? [];
    const q = query.trim().toLowerCase();
    if (q.length === 0) return all;
    return all.filter((item) => item.title.toLowerCase().includes(q));
  }, [data, query]);

  return (
    <Screen scroll>
      <PageHeader title="Doa Harian" subtitle="Doa untuk aktivitas sehari-hari" />

      {isPending ? (
        <SkeletonList count={5} height={140} />
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      ) : (
        <View style={styles.body}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder="Cari doa, misal: makan, tidur..."
          />

          {items.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={colors.textFaint} />
              <Text style={styles.emptyTitle}>Tidak ditemukan</Text>
              <Text style={styles.emptyMessage}>Coba kata kunci lain, misalnya &quot;makan&quot; atau &quot;tidur&quot;.</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {items.map((item, index) => (
                <Animated.View
                  key={`${index}-${item.title}`}
                  entering={FadeInDown.springify().delay(Math.min(index, 8) * 60)}
                  style={styles.card}
                >
                  <Text style={styles.title}>{item.title}</Text>
                  <ArabicText size={26} style={styles.arabic}>
                    {item.arabic}
                  </ArabicText>
                  <Text style={styles.latin}>{item.latin}</Text>
                  <Text style={styles.translation}>{item.translation}</Text>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.lg,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.base,
    gap: spacing.md,
  },
  title: {
    ...typography.h3,
  },
  arabic: {
    marginTop: spacing.xs,
  },
  latin: {
    fontFamily: font.regular,
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
  },
  translation: {
    ...typography.caption,
    fontSize: 13,
    lineHeight: 19,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyTitle: {
    ...typography.h3,
    marginTop: spacing.md,
  },
  emptyMessage: {
    ...typography.caption,
    textAlign: 'center',
    maxWidth: 240,
  },
});

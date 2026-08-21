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
import { registerStrings, useLang } from '@/i18n';
import { getDoaHarian } from '@/lib/api';
import { font, radius, spacing, useTheme, type ThemeColors } from '@/theme';

registerStrings('doaHarian', {
  title: 'Doa Harian',
  subtitle: 'Doa untuk aktivitas sehari-hari',
  emptyTitle: 'Tidak ditemukan',
  emptyMessage: 'Coba kata kunci lain, misalnya "makan" atau "tidur".',
}, {
  title: 'Daily Duas',
  subtitle: 'Duas for everyday activities',
  emptyTitle: 'Not found',
  emptyMessage: 'Try other keywords, e.g. "eating" or "sleeping".',
});

export default function DoaHarianScreen() {
  const { t } = useLang();
  const { colors, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
      <PageHeader title={t('doaHarian.title')} subtitle={t('doaHarian.subtitle')} />

      {isPending ? (
        <SkeletonList count={5} height={140} />
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={() => refetch()} />
      ) : (
        <View style={styles.body}>
          <SearchBar
            value={query}
            onChangeText={setQuery}
            placeholder={t('common.search')}
          />

          {items.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={40} color={colors.textFaint} />
              <Text style={[typography.h3, styles.emptyTitle]}>{t('doaHarian.emptyTitle')}</Text>
              <Text style={[typography.caption, styles.emptyMessage]}>{t('doaHarian.emptyMessage')}</Text>
            </View>
          ) : (
            <View style={styles.list}>
              {items.map((item, index) => (
                <Animated.View
                  key={`${index}-${item.title}`}
                  entering={FadeInDown.springify().delay(Math.min(index, 8) * 60)}
                  style={styles.card}
                >
                  <Text style={typography.h3}>{item.title}</Text>
                  <ArabicText size={26} style={styles.arabic}>
                    {item.arabic}
                  </ArabicText>
                  <Text style={styles.latin}>{item.latin}</Text>
                  <Text style={[typography.caption, styles.translation]}>{item.translation}</Text>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      )}
    </Screen>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    body: {
      gap: spacing.lg,
    },
    list: {
      gap: spacing.md,
    },
    card: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.lg,
      padding: spacing.base,
      gap: spacing.md,
    },
    arabic: {
      marginTop: spacing.xs,
    },
    latin: {
      fontFamily: font.regular,
      fontStyle: 'italic',
      fontSize: 13,
      lineHeight: 20,
      color: c.textMuted,
    },
    translation: {
      fontSize: 13,
      lineHeight: 19,
    },
    empty: {
      alignItems: 'center',
      paddingVertical: spacing.xxxl,
      gap: spacing.sm,
    },
    emptyTitle: {
      marginTop: spacing.md,
    },
    emptyMessage: {
      textAlign: 'center',
      maxWidth: 240,
    },
  });

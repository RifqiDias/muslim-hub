import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArabicText } from '@/components/ui/arabic-text';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SearchBar } from '@/components/ui/search-bar';
import { SkeletonList } from '@/components/ui/skeleton';
import { font, radius, spacing, useTheme, type ThemeColors } from '@/theme';
import { getSurahList } from '@/lib/api';
import { getJSON, StorageKeys } from '@/lib/storage';
import type { SurahSummary } from '@/lib/types';

interface LastReadSurah {
  number: number;
  name: string;
  ayat: number;
}

export default function QuranScreen() {
  const [search, setSearch] = useState('');
  const [lastRead, setLastRead] = useState<LastReadSurah | null>(null);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['surah-list'],
    queryFn: getSurahList,
  });

  useEffect(() => {
    getJSON<LastReadSurah>(StorageKeys.lastReadSurah).then(setLastRead);
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (item) =>
        item.name.transliteration.id.toLowerCase().includes(q) ||
        item.name.translation.id.toLowerCase().includes(q) ||
        String(item.number).includes(q),
    );
  }, [data, search]);

  const openSurah = (number: number) => {
    router.push({ pathname: '/quran/[surah]', params: { surah: String(number) } });
  };

  return (
    <Screen edges={['top']}>
      <PageHeader back={false} title="Al Qur'an" subtitle="114 Surah • Terjemahan & Tafsir" />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Cari nama, arti, atau nomor surah" delay={60} />
      {lastRead && typeof lastRead.number === 'number' ? (
        <Animated.View entering={FadeInDown.springify().delay(120)}>
          <PressableScale onPress={() => openSurah(lastRead.number)} style={styles.lastReadChip}>
            <Ionicons name="bookmark" size={16} color={colors.gold} />
            <Text style={styles.lastReadText} numberOfLines={1}>
              Terakhir dibaca: {lastRead.name}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </PressableScale>
        </Animated.View>
      ) : null}
      <View style={styles.spacer} />
      {isLoading ? (
        <SkeletonList count={7} height={92} />
      ) : isError ? (
        <ErrorState message="Daftar surah tidak dapat dimuat." onRetry={() => refetch()} />
      ) : (
        <FlatList
          style={styles.list}
          data={filtered}
          keyExtractor={(item) => String(item.number)}
          renderItem={({ item, index }) => (
            <SurahCard item={item} index={index} onPress={() => openSurah(item.number)} />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={36} color={colors.textFaint} />
              <Text style={styles.emptyText}>Tidak ada surah yang cocok untuk &quot;{search.trim()}&quot;</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </Screen>
  );
}

function SurahCard({ item, index, onPress }: { item: SurahSummary; index: number; onPress: () => void }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Animated.View entering={FadeInDown.springify().delay(Math.min(index, 12) * 40)}>
      <PressableScale onPress={onPress} style={styles.card}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{item.number}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.nameText} numberOfLines={1}>
            {item.name.transliteration.id}
          </Text>
          <Text style={styles.meaningText} numberOfLines={1}>
            {item.name.translation.id}
          </Text>
          <View style={styles.chipRow}>
            <View style={styles.miniChip}>
              <Text style={styles.miniChipText}>{item.numberOfVerses} Ayat</Text>
            </View>
            <View style={styles.miniChip}>
              <Text style={styles.miniChipText}>{item.revelation.id}</Text>
            </View>
          </View>
        </View>
        <ArabicText size={26} color={colors.gold} numberOfLines={1}>
          {item.name.short}
        </ArabicText>
      </PressableScale>
    </Animated.View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    spacer: {
      height: spacing.md,
    },
    list: {
      flex: 1,
    },
    listContent: {
      gap: spacing.md,
      paddingBottom: spacing.xl,
    },
    lastReadChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: c.goldSoft,
      borderWidth: 1,
      borderColor: c.gold,
      borderRadius: radius.full,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm + 2,
      marginTop: spacing.md,
    },
    lastReadText: {
      flex: 1,
      fontFamily: font.semibold,
      fontSize: 13,
      color: c.text,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.lg,
      padding: spacing.base,
    },
    numberBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    numberText: {
      fontFamily: font.bold,
      fontSize: 14,
      color: c.bg,
    },
    info: {
      flex: 1,
      gap: 2,
    },
    nameText: {
      fontFamily: font.bold,
      fontSize: 15,
      color: c.text,
    },
    meaningText: {
      fontFamily: font.regular,
      fontSize: 12,
      color: c.textMuted,
    },
    chipRow: {
      flexDirection: 'row',
      gap: 6,
      marginTop: 4,
    },
    miniChip: {
      backgroundColor: c.surfaceAlt,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.full,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    miniChipText: {
      fontFamily: font.semibold,
      fontSize: 11,
      color: c.textMuted,
    },
    empty: {
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xxxl,
    },
    emptyText: {
      fontFamily: font.regular,
      fontSize: 13,
      color: c.textMuted,
      textAlign: 'center',
    },
  });

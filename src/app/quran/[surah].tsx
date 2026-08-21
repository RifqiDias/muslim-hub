import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { shareText } from '@/components/quran-share';
import { ArabicText } from '@/components/ui/arabic-text';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SkeletonList } from '@/components/ui/skeleton';
import { colors, font, gradients, radius, spacing } from '@/theme';
import { getSurahDetail } from '@/lib/api';
import { setJSON, StorageKeys } from '@/lib/storage';
import type { Verse } from '@/lib/types';

export default function SurahDetailScreen() {
  const { surah } = useLocalSearchParams<{ surah: string }>();
  const surahParam = surah ?? '1';
  const [tafsirOpen, setTafsirOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['surah', surahParam],
    queryFn: () => getSurahDetail(surahParam),
  });

  useEffect(() => {
    if (data) {
      setJSON(StorageKeys.lastReadSurah, {
        number: data.number,
        name: data.name.transliteration.id,
        ayat: 1,
      });
    }
  }, [data]);

  if (isLoading) {
    return (
      <Screen scroll>
        <PageHeader title="Surah" subtitle="Memuat data surah..." />
        <SkeletonList count={5} height={150} />
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen scroll>
        <PageHeader title="Surah" subtitle="Gagal memuat" />
        <ErrorState message="Detail surah tidak dapat dimuat." onRetry={() => refetch()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        style={styles.list}
        data={data.verses}
        keyExtractor={(verse) => String(verse.number.inSurah)}
        renderItem={({ item, index }) => (
          <VerseCard verse={item} index={index} surahName={data.name.transliteration.id} />
        )}
        ListHeaderComponent={
          <View>
            <PageHeader
              title={data.name.transliteration.id}
              subtitle={`${data.revelation.id} • ${data.numberOfVerses} Ayat`}
            />
            <Animated.View entering={FadeInDown.duration(450)}>
              <LinearGradient
                colors={[...gradients.emerald]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
              >
                <ArabicText size={36} bold center color={colors.gold}>
                  {data.name.long}
                </ArabicText>
                <Text style={styles.heroTransliteration}>{data.name.transliteration.id}</Text>
                <Text style={styles.heroMeaning}>{data.name.translation.id}</Text>
                <View style={styles.heroChips}>
                  <View style={styles.heroChip}>
                    <Ionicons name="location-outline" size={12} color={colors.primary} />
                    <Text style={styles.heroChipText}>{data.revelation.id}</Text>
                  </View>
                  <View style={styles.heroChip}>
                    <Text style={styles.heroChipText}>{data.numberOfVerses} Ayat</Text>
                  </View>
                  <View style={styles.heroChip}>
                    <Text style={styles.heroChipText}>Surah ke-{data.number}</Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
            {data.preBismillah ? (
              <Animated.View entering={FadeInDown.duration(400).delay(80)} style={styles.bismillahCard}>
                <ArabicText size={24} center>
                  {data.preBismillah.text.arab}
                </ArabicText>
                <Text style={styles.bismillahTranslation}>{data.preBismillah.text.translation.id}</Text>
              </Animated.View>
            ) : null}
            <PressableScale onPress={() => setTafsirOpen((value) => !value)} style={styles.tafsirToggle}>
              <Ionicons name="book-outline" size={16} color={colors.primary} />
              <Text style={styles.tafsirToggleText}>Tafsir Surah</Text>
              <Chevron open={tafsirOpen} />
            </PressableScale>
            {tafsirOpen ? (
              <Animated.View entering={FadeIn.duration(300)} style={styles.tafsirCard}>
                <Text style={styles.tafsirText}>{data.tafsir.id}</Text>
              </Animated.View>
            ) : null}
            <View style={styles.spacer} />
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

function Chevron({ open }: { open: boolean }) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withTiming(open ? 90 : 0, { duration: 200 });
  }, [open, rotation]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Animated.View>
  );
}

function VerseCard({ verse, index, surahName }: { verse: Verse; index: number; surahName: string }) {
  const [copied, setCopied] = useState(false);
  const translation = verse.translation?.id ?? '';
  const payload = `${verse.text.arab}\n\n${translation}\n\n(${surahName}: ${verse.number.inSurah})`;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleShare = () => {
    shareText(`QS. ${surahName}: ${verse.number.inSurah}`, payload);
  };

  return (
    <Animated.View entering={FadeInDown.duration(350).delay(Math.min(index, 10) * 50)} style={styles.verseCard}>
      <View style={styles.verseHeader}>
        <View style={styles.verseBadge}>
          <Text style={styles.verseBadgeText}>{verse.number.inSurah}</Text>
        </View>
        <View style={styles.verseActions}>
          <PressableScale onPress={handleCopy} haptic={false} style={styles.actionBtn} hitSlop={6}>
            {copied ? (
              <Animated.View entering={ZoomIn.duration(200)}>
                <Ionicons name="checkmark" size={17} color={colors.primary} />
              </Animated.View>
            ) : (
              <Ionicons name="copy-outline" size={16} color={colors.textMuted} />
            )}
          </PressableScale>
          <PressableScale onPress={handleShare} style={styles.actionBtn} hitSlop={6}>
            <Ionicons name="share-social-outline" size={16} color={colors.textMuted} />
          </PressableScale>
        </View>
      </View>
      <ArabicText size={28}>{verse.text.arab}</ArabicText>
      <Text style={styles.verseTranslation}>{translation}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  spacer: {
    height: spacing.md,
  },
  hero: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  heroTransliteration: {
    fontFamily: font.bold,
    fontSize: 20,
    color: colors.white,
    marginTop: spacing.md,
  },
  heroMeaning: {
    fontFamily: font.regular,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 2,
  },
  heroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  heroChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  heroChipText: {
    fontFamily: font.semibold,
    fontSize: 11,
    color: colors.text,
  },
  bismillahCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.base,
    alignItems: 'center',
    gap: spacing.xs,
  },
  bismillahTranslation: {
    fontFamily: font.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  tafsirToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md + 2,
  },
  tafsirToggleText: {
    flex: 1,
    fontFamily: font.semibold,
    fontSize: 14,
    color: colors.text,
  },
  tafsirCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.base,
  },
  tafsirText: {
    fontFamily: font.regular,
    fontSize: 13.5,
    lineHeight: 22,
    color: colors.text,
  },
  verseCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  verseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verseBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.gold,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseBadgeText: {
    fontFamily: font.bold,
    fontSize: 13,
    color: colors.gold,
  },
  verseActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verseTranslation: {
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { shareText } from '@/components/quran-share';
import { QuranAudioPlayer } from '@/components/quran-audio-player';
import { ArabicText } from '@/components/ui/arabic-text';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SkeletonList } from '@/components/ui/skeleton';
import { registerStrings, useLang, type Lang } from '@/i18n';
import { getSurahDetailJson, getSurahTransliteration } from '@/lib/api';
import { getString, setJSON, setString, StorageKeys } from '@/lib/storage';
import { QuranJsonVerse } from '@/lib/types';
import { ThemeColors, font, radius, spacing, useTheme } from '@/theme';

registerStrings('surahDetail', {
  loadingSubtitle: 'Memuat data surah...',
  errorSubtitle: 'Gagal memuat',
  versesCount: '{count} Ayat',
  surahNumber: 'Surah ke-{number}',
  tafsirVerse: 'Tafsir Kemenag',
  tafsirSurah: 'Tafsir Surah',
  translation: 'Terjemahan',
  latin: 'Latin',
  openMushaf: 'Buka di Mushaf',
}, {
  loadingSubtitle: 'Loading surah data...',
  errorSubtitle: 'Failed to load',
  versesCount: '{count} Verses',
  surahNumber: 'Surah {number}',
  tafsirVerse: 'Kemenag Tafsir',
  tafsirSurah: 'Surah Tafsir',
  translation: 'Translation',
  latin: 'Latin',
  openMushaf: 'Open in Mushaf',
});

const TRANSLATION_KEY = 'muslimhub.quran.translation';
const LATIN_KEY = 'muslimhub.quran.latin';

export default function SurahDetailScreen() {
  const { t, lang } = useLang();
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const { surah } = useLocalSearchParams<{ surah: string }>();
  const surahParam = surah ?? '1';
  const [tafsirOpen, setTafsirOpen] = useState(false);
  const [translationLang, setTranslationLang] = useState<Lang>(lang);
  const [latinVisible, setLatinVisible] = useState(true);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['quranjson-surah', surahParam],
    queryFn: () => getSurahDetailJson(surahParam),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const translitQuery = useQuery({
    queryKey: ['quranjson-translit', surahParam],
    queryFn: () => getSurahTransliteration(surahParam),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });

  useEffect(() => {
    getString(TRANSLATION_KEY)
      .then((value) => {
        if (value === 'en' || value === 'id') setTranslationLang(value);
      })
      .catch(() => undefined);
    getString(LATIN_KEY)
      .then((value) => {
        if (value === 'off') setLatinVisible(false);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (data) {
      setJSON(StorageKeys.lastReadSurah, {
        number: data.number_of_surah,
        name: data.name,
        ayat: 1,
      });
    }
  }, [data]);

  const switchTranslation = (next: Lang) => {
    setTranslationLang(next);
    setString(TRANSLATION_KEY, next).catch(() => undefined);
  };

  const toggleLatin = () => {
    const next = !latinVisible;
    setLatinVisible(next);
    setString(LATIN_KEY, next ? 'on' : 'off').catch(() => undefined);
  };

  if (isPending) {
    return (
      <Screen scroll>
        <PageHeader title={t('quranList.title')} subtitle={t('surahDetail.loadingSubtitle')} />
        <SkeletonList count={5} height={150} />
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen scroll>
        <PageHeader title={t('quranList.title')} subtitle={t('surahDetail.errorSubtitle')} />
        <ErrorState onRetry={() => refetch()} />
      </Screen>
    );
  }

  const meaning = data.name_translations[lang] ?? data.name_translations.id;

  return (
    <Screen>
      <FlatList
        style={styles.list}
        data={data.verses}
        keyExtractor={(verse) => String(verse.number)}
        renderItem={({ item, index }) => (
          <VerseCard
            verse={item}
            index={index}
            surahName={data.name}
            translationLang={translationLang}
            transliteration={translitQuery.data?.[item.number] ?? null}
            latinVisible={latinVisible}
            tafsirText={data.tafsir?.id?.kemenag?.text?.[String(item.number)] ?? null}
          />
        )}
        ListHeaderComponent={
          <View>
            <PageHeader
              title={data.name}
              subtitle={`${data.type} · ${t('surahDetail.versesCount', { count: data.number_of_ayah })}`}
              right={
                <PressableScale
                  onPress={() =>
                    router.push({ pathname: '/quran/mushaf', params: { surah: String(data.number_of_surah) } })
                  }
                  style={styles.mushafBtn}
                  hitSlop={8}
                >
                  <Ionicons name="book" size={20} color={colors.gold} />
                </PressableScale>
              }
            />
            <Animated.View entering={FadeInDown.duration(450)}>
              <LinearGradient
                colors={[...gradients.emerald]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
              >
                <ArabicText size={36} bold center color={colors.gold}>
                  {data.name_translations.ar}
                </ArabicText>
                <Text style={styles.heroTransliteration}>{data.name}</Text>
                <Text style={styles.heroMeaning}>{meaning}</Text>
                <View style={styles.heroChips}>
                  <View style={styles.heroChip}>
                    <Ionicons name="location-outline" size={12} color={colors.gold} />
                    <Text style={styles.heroChipText}>{data.place}</Text>
                  </View>
                  <View style={styles.heroChip}>
                    <Text style={styles.heroChipText}>{data.type}</Text>
                  </View>
                  <View style={styles.heroChip}>
                    <Text style={styles.heroChipText}>
                      {t('surahDetail.surahNumber', { number: data.number_of_surah })}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>
            {data.recitations.length > 0 ? (
              <QuranAudioPlayer
                recitations={data.recitations}
                surahLabel={data.name}
                style={styles.audioCard}
              />
            ) : null}
            <View style={styles.translationSwitchRow}>
              <Text style={styles.translationLabel}>{t('surahDetail.translation')}</Text>
              <View style={styles.translationControls}>
                <View style={styles.translationSwitch}>
                  {(['id', 'en'] as Lang[]).map((code) => {
                    const active = translationLang === code;
                    return (
                      <PressableScale
                        key={code}
                        onPress={() => switchTranslation(code)}
                        haptic={false}
                        style={styles.translationOptionPress}
                      >
                        <View style={[styles.translationOption, active && styles.translationOptionActive]}>
                          <Text style={[styles.translationOptionText, active && styles.translationOptionTextActive]}>
                            {code === 'id' ? 'Indonesia' : 'English'}
                          </Text>
                        </View>
                      </PressableScale>
                    );
                  })}
                </View>
                <PressableScale onPress={toggleLatin} haptic={false} style={styles.translationOptionPress}>
                  <View
                    style={[
                      styles.translationOption,
                      latinVisible && styles.translationOptionActive,
                      !latinVisible && styles.latinOptionIdle,
                    ]}
                  >
                    <Ionicons
                      name="language"
                      size={12}
                      color={latinVisible ? colors.primary : colors.textMuted}
                    />
                    <Text style={[styles.translationOptionText, latinVisible && styles.translationOptionTextActive]}>
                      {t('surahDetail.latin')}
                    </Text>
                  </View>
                </PressableScale>
              </View>
            </View>
            <PressableScale onPress={() => setTafsirOpen((value) => !value)} style={styles.tafsirToggle}>
              <Ionicons name="book-outline" size={16} color={colors.primary} />
              <Text style={styles.tafsirToggleText}>{t('surahDetail.tafsirSurah')}</Text>
              <Ionicons
                name={tafsirOpen ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.textMuted}
              />
            </PressableScale>
            {tafsirOpen ? (
              <Animated.View entering={FadeIn.duration(300)} style={styles.tafsirCard}>
                <Text style={styles.tafsirText}>{data.tafsir?.id?.kemenag?.text?.['1'] ?? '—'}</Text>
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

function VerseCard({
  verse,
  index,
  surahName,
  translationLang,
  transliteration,
  latinVisible,
  tafsirText,
}: {
  verse: QuranJsonVerse;
  index: number;
  surahName: string;
  translationLang: Lang;
  transliteration: string | null;
  latinVisible: boolean;
  tafsirText: string | null;
}) {
  const { t } = useLang();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [copied, setCopied] = useState(false);
  const [tafsirOpen, setTafsirOpen] = useState(false);

  const translation = translationLang === 'en' ? verse.translation_en : verse.translation_id;
  const payload = `${verse.text}\n\n${translation}\n\n(${surahName}: ${verse.number})`;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleShare = () => {
    shareText(`QS. ${surahName}: ${verse.number}`, payload);
  };

  return (
    <Animated.View entering={FadeInDown.duration(350).delay(Math.min(index, 10) * 50)} style={styles.verseCard}>
      <View style={styles.verseHeader}>
        <View style={styles.verseBadge}>
          <Text style={styles.verseBadgeText}>{verse.number}</Text>
        </View>
        <View style={styles.verseActions}>
          {tafsirText ? (
            <PressableScale onPress={() => setTafsirOpen((value) => !value)} haptic={false} style={styles.actionBtn} hitSlop={6}>
              <Ionicons
                name={tafsirOpen ? 'book' : 'book-outline'}
                size={16}
                color={tafsirOpen ? colors.primary : colors.textMuted}
              />
            </PressableScale>
          ) : null}
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
      <ArabicText size={28}>{verse.text}</ArabicText>
      {latinVisible && transliteration ? (
        <Text style={styles.verseTransliteration}>{transliteration}</Text>
      ) : null}
      <Text style={styles.verseTranslation}>{translation}</Text>
      {tafsirText && tafsirOpen ? (
        <Animated.View entering={FadeIn.duration(250)} style={styles.verseTafsir}>
          <View style={styles.verseTafsirHeader}>
            <Ionicons name="book" size={12} color={colors.gold} />
            <Text style={styles.verseTafsirTitle}>{t('surahDetail.tafsirVerse')}</Text>
          </View>
          <Text style={styles.verseTafsirText}>{tafsirText}</Text>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    list: {
      flex: 1,
    },
    mushafBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    listContent: {
      paddingHorizontal: spacing.base,
      paddingBottom: spacing.xxl,
      gap: spacing.md,
    },
    hero: {
      borderRadius: radius.xl,
      padding: spacing.xl,
      alignItems: 'center',
    },
    heroTransliteration: {
      fontFamily: font.bold,
      fontSize: 20,
      color: c.text,
      marginTop: spacing.md,
    },
    heroMeaning: {
      fontFamily: font.regular,
      fontSize: 13,
      color: c.textMuted,
      marginTop: 2,
    },
    heroChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.sm,
      marginTop: spacing.md,
    },
    heroChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderRadius: radius.full,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    heroChipText: {
      fontFamily: font.semibold,
      fontSize: 11,
      color: c.text,
    },
    audioCard: {
      marginTop: spacing.md,
    },
    translationSwitchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.md,
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    translationControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    translationLabel: {
      fontFamily: font.semibold,
      fontSize: 12,
      color: c.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    translationSwitch: {
      flexDirection: 'row',
      backgroundColor: c.surface,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: c.border,
      padding: 3,
    },
    translationOptionPress: {
      borderRadius: radius.full,
    },
    translationOption: {
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: radius.full,
    },
    translationOptionActive: {
      backgroundColor: c.primarySoft,
    },
    translationOptionText: {
      fontFamily: font.semibold,
      fontSize: 12,
      color: c.textMuted,
    },
    translationOptionTextActive: {
      color: c.primary,
    },
    latinOptionIdle: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    tafsirToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    tafsirToggleText: {
      flex: 1,
      fontFamily: font.semibold,
      fontSize: 13.5,
      color: c.text,
    },
    tafsirCard: {
      marginTop: spacing.sm,
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: c.surfaceAlt,
      borderWidth: 1,
      borderColor: c.border,
    },
    tafsirText: {
      fontFamily: font.regular,
      fontSize: 12.5,
      lineHeight: 20,
      color: c.text,
    },
    spacer: {
      height: spacing.md,
    },
    verseCard: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.xl,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    verseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    verseBadge: {
      minWidth: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1.5,
      borderColor: c.gold,
      backgroundColor: c.goldSoft,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 8,
    },
    verseBadgeText: {
      fontFamily: font.bold,
      fontSize: 13,
      color: c.gold,
    },
    verseActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    actionBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    verseTransliteration: {
      fontFamily: font.regular,
      fontSize: 12.5,
      lineHeight: 19,
      fontStyle: 'italic',
      color: c.gold,
    },
    verseTranslation: {
      fontFamily: font.regular,
      fontSize: 13.5,
      lineHeight: 21,
      color: c.textMuted,
    },
    verseTafsir: {
      backgroundColor: c.surfaceAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm,
    },
    verseTafsirHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    verseTafsirTitle: {
      fontFamily: font.semibold,
      fontSize: 11.5,
      color: c.gold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    verseTafsirText: {
      fontFamily: font.regular,
      fontSize: 12.5,
      lineHeight: 20,
      color: c.text,
    },
  });

import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { shareText } from '@/components/quran-share';
import { ArabicText } from '@/components/ui/arabic-text';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { SkeletonList } from '@/components/ui/skeleton';
import { font, radius, spacing, useTheme, type ThemeColors } from '@/theme';
import { getAyatKursi } from '@/lib/api';

export default function AyatKursiScreen() {
  const [copied, setCopied] = useState(false);
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['ayat-kursi'],
    queryFn: getAyatKursi,
  });

  const fullText = data
    ? [data.arabic, data.latin, data.translation].filter((part): part is string => Boolean(part)).join('\n\n')
    : '';

  const handleCopy = async () => {
    await Clipboard.setStringAsync(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleShare = () => {
    shareText('Ayat Kursi', fullText);
  };

  if (isLoading) {
    return (
      <Screen scroll>
        <PageHeader title="Ayat Kursi" subtitle="QS. Al-Baqarah: 255" />
        <SkeletonList count={3} height={160} />
      </Screen>
    );
  }

  if (isError || !data) {
    return (
      <Screen scroll>
        <PageHeader title="Ayat Kursi" subtitle="Gagal memuat" />
        <ErrorState message="Ayat Kursi tidak dapat dimuat." onRetry={() => refetch()} />
      </Screen>
    );
  }

  const paragraphs = data.tafsir
    .split('\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <Screen scroll>
      <PageHeader title="Ayat Kursi" subtitle="QS. Al-Baqarah: 255" />
      <Animated.View entering={FadeInDown.duration(450)}>
        <LinearGradient
          colors={[...gradients.night]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroBadge}>
            <Ionicons name="star-outline" size={12} color={colors.gold} />
            <Text style={styles.heroBadgeText}>Ayat Agung • QS. Al-Baqarah: 255</Text>
          </View>
          {data.arabic ? (
            <ArabicText size={30} center color={colors.gold}>
              {data.arabic}
            </ArabicText>
          ) : null}
        </LinearGradient>
      </Animated.View>
      {data.latin || data.translation ? (
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.contentCard}>
          {data.latin ? <Text style={styles.latinText}>{data.latin}</Text> : null}
          {data.latin && data.translation ? <View style={styles.divider} /> : null}
          {data.translation ? <Text style={styles.translationText}>{data.translation}</Text> : null}
        </Animated.View>
      ) : null}
      <SectionHeader title="Tafsir" />
      <View style={styles.tafsirCard}>
        {paragraphs.map((paragraph, index) => (
          <Animated.Text
            key={index}
            entering={FadeInDown.springify().delay(index * 90)}
            style={styles.tafsirText}
          >
            {paragraph}
          </Animated.Text>
        ))}
      </View>
      <Animated.View entering={FadeInDown.duration(400).delay(160)} style={styles.actions}>
        <PressableScale onPress={handleCopy} style={styles.primaryBtn}>
          {copied ? (
            <Animated.View entering={ZoomIn.duration(200)}>
              <Ionicons name="checkmark" size={18} color={colors.bg} />
            </Animated.View>
          ) : (
            <Ionicons name="copy-outline" size={18} color={colors.bg} />
          )}
          <Text style={styles.primaryBtnText}>{copied ? 'Tersalin' : 'Salin'}</Text>
        </PressableScale>
        <PressableScale onPress={handleShare} style={styles.secondaryBtn}>
          <Ionicons name="share-social-outline" size={18} color={colors.primary} />
          <Text style={styles.secondaryBtnText}>Bagikan</Text>
        </PressableScale>
      </Animated.View>
    </Screen>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    hero: {
      borderRadius: radius.xl,
      padding: spacing.xl,
      alignItems: 'center',
      gap: spacing.md,
    },
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.goldSoft,
      borderRadius: radius.full,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    heroBadgeText: {
      fontFamily: font.semibold,
      fontSize: 11,
      color: c.gold,
    },
    contentCard: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
      marginTop: spacing.md,
    },
    latinText: {
      fontFamily: font.regular,
      fontStyle: 'italic',
      fontSize: 14,
      lineHeight: 22,
      color: c.textMuted,
    },
    divider: {
      height: 1,
      backgroundColor: c.border,
      marginVertical: spacing.md,
    },
    translationText: {
      fontFamily: font.regular,
      fontSize: 14,
      lineHeight: 23,
      color: c.text,
    },
    tafsirCard: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.md,
    },
    tafsirText: {
      fontFamily: font.regular,
      fontSize: 13.5,
      lineHeight: 22,
      color: c.text,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.xl,
    },
    primaryBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: c.primary,
      borderRadius: radius.full,
      paddingVertical: spacing.md + 2,
    },
    primaryBtnText: {
      fontFamily: font.bold,
      fontSize: 14,
      color: c.bg,
    },
    secondaryBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.borderStrong,
      borderRadius: radius.full,
      paddingVertical: spacing.md + 2,
    },
    secondaryBtnText: {
      fontFamily: font.bold,
      fontSize: 14,
      color: c.primary,
    },
  });

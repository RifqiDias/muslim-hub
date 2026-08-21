import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { HomeTile } from '@/components/home-tile';
import { ArabicText } from '@/components/ui/arabic-text';
import { ErrorState } from '@/components/ui/error-state';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { SkeletonBlock } from '@/components/ui/skeleton';
import { getDoaPilihan, getPrayerTimes, getRandomWallpaper } from '@/lib/api';
import { getString, StorageKeys } from '@/lib/storage';
import { PrayerTimings } from '@/lib/types';
import { colors, font, gradients, radius, spacing } from '@/theme';

const WALL_BLURHASH = 'L6PZ0S^jE1of~qx]^%M{JeR*fiM{';

const PRAYER_ORDER: { key: keyof PrayerTimings; label: string }[] = [
  { key: 'Fajr', label: 'Subuh' },
  { key: 'Dhuhr', label: 'Dzuhur' },
  { key: 'Asr', label: 'Ashar' },
  { key: 'Maghrib', label: 'Maghrib' },
  { key: 'Isha', label: 'Isya' },
];

interface QuickMenuItem {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: keyof typeof gradients;
  href: Href;
}

const QUICK_MENU: QuickMenuItem[] = [
  { title: "Qur'an", subtitle: 'Mushaf & terjemahan', icon: 'book', gradient: 'emerald', href: '/(tabs)/quran' },
  { title: 'Jadwal Shalat', subtitle: 'Waktu shalat harian', icon: 'time', gradient: 'teal', href: '/(tabs)/jadwal' },
  { title: 'Dzikir', subtitle: 'Pagi & petang', icon: 'moon', gradient: 'night', href: '/(tabs)/dzikir' },
  { title: 'Hadits', subtitle: 'Kutipan sahih', icon: 'newspaper', gradient: 'gold', href: '/hadith' },
  { title: 'Asmaul Husna', subtitle: '99 nama Allah', icon: 'sparkles', gradient: 'plum', href: '/asmaul-husna' },
  { title: 'Kisah Nabi', subtitle: '25 nabi & rasul', icon: 'people', gradient: 'emerald', href: '/kisah-nabi' },
  { title: 'Tanya AI', subtitle: 'Qalbun AI', icon: 'chatbubbles', gradient: 'night', href: '/ai' },
  { title: 'Semua', subtitle: 'Lihat semua fitur', icon: 'grid', gradient: 'gold', href: '/(tabs)/more' },
];

function parseHM(value: string): number | null {
  const match = /(\d{1,2}):(\d{2})/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatHM(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatRemaining(minutes: number): string {
  if (minutes <= 0) return 'waktunya telah tiba';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} menit lagi`;
  if (m === 0) return `${h} jam lagi`;
  return `${h} jam ${m} menit lagi`;
}

export default function BerandaScreen() {
  const [city, setCity] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [wallpaperSeed] = useState(() => Math.floor(Date.now() / 86400000));

  useEffect(() => {
    getString(StorageKeys.city)
      .then((value) => setCity(value))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const prayerQuery = useQuery({
    queryKey: ['prayer-times', city ?? null],
    queryFn: () => getPrayerTimes({ city: city ?? undefined }),
  });

  const wallpaperQuery = useQuery({
    queryKey: ['wallpaper', wallpaperSeed],
    queryFn: () => getRandomWallpaper(),
  });

  const doaQuery = useQuery({ queryKey: ['doa-pilihan'], queryFn: getDoaPilihan });

  const greeting = useMemo(() => {
    const hour = now.getHours();
    if (hour >= 4 && hour < 11) return 'Selamat pagi';
    if (hour >= 11 && hour < 15) return 'Selamat siang';
    if (hour >= 15 && hour < 18) return 'Selamat sore';
    return 'Selamat malam';
  }, [now]);

  const gregorianText = now.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const hijri = prayerQuery.data?.date?.hijri;
  const hijriText = hijri
    ? [hijri.day, hijri.month?.en, hijri.year ? `${hijri.year} H` : null].filter(Boolean).join(' ')
    : null;

  const doaHariIni =
    doaQuery.data && doaQuery.data.length > 0
      ? doaQuery.data[wallpaperSeed % doaQuery.data.length]
      : null;

  const nextPrayer = (() => {
    const timings = prayerQuery.data?.timings;
    if (!timings) return null;
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    for (const prayer of PRAYER_ORDER) {
      const parsed = parseHM(timings[prayer.key]);
      if (parsed !== null && parsed > minutesNow) {
        return { label: prayer.label, minutes: parsed, remaining: parsed - minutesNow };
      }
    }
    const fajr = parseHM(timings.Fajr);
    if (fajr === null) return null;
    return { label: 'Subuh', minutes: fajr, remaining: 1440 - minutesNow + fajr };
  })();

  const prayerFailed = prayerQuery.isError || (!prayerQuery.isLoading && !nextPrayer);

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown.duration(450)} style={styles.headerRow}>
        <View style={styles.headerTitles}>
          <Text style={styles.salam}>Assalamu&apos;alaikum</Text>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.dateText}>{gregorianText}</Text>
          {hijriText ? <Text style={styles.hijriText}>{hijriText}</Text> : null}
        </View>
        <LinearGradient colors={[...gradients.gold]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerBadge}>
          <Ionicons name="moon" size={26} color={colors.gold} />
        </LinearGradient>
      </Animated.View>

      {prayerFailed ? (
        <ErrorState message="Jadwal shalat gagal dimuat." onRetry={() => prayerQuery.refetch()} />
      ) : nextPrayer ? (
        <Animated.View entering={FadeInDown.duration(450).delay(90)}>
          <LinearGradient
            colors={[...gradients.emerald]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.prayerCard}
          >
            <View style={styles.prayerIcon}>
              <Ionicons name="time" size={26} color={colors.gold} />
            </View>
            <View style={styles.prayerInfo}>
              <Text style={styles.prayerLabel}>Shalat berikutnya</Text>
              <View style={styles.prayerRow}>
                <Text style={styles.prayerName}>{nextPrayer.label}</Text>
                <Text style={styles.prayerTime}>{formatHM(nextPrayer.minutes)}</Text>
              </View>
              <Text style={styles.prayerCountdown}>{formatRemaining(nextPrayer.remaining)}</Text>
            </View>
          </LinearGradient>
        </Animated.View>
      ) : (
        <SkeletonBlock width="100%" height={118} radius={radius.xl} />
      )}

      <Animated.View entering={FadeInDown.duration(450).delay(170)} style={styles.heroSection}>
        {wallpaperQuery.isLoading ? (
          <SkeletonBlock width="100%" height={180} radius={radius.xl} />
        ) : wallpaperQuery.data ? (
          <View style={styles.heroCard}>
            <Image
              source={{ uri: wallpaperQuery.data }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={500}
              placeholder={{ blurhash: WALL_BLURHASH }}
            />
            <LinearGradient
              colors={['rgba(6,16,9,0)', 'rgba(6,16,9,0.84)']}
              style={styles.heroOverlay}
            >
              <View style={styles.heroTitles}>
                <Text style={styles.heroTitle}>Wallpaper Islami</Text>
                <Text style={styles.heroSub}>Hiasan layar penuh berkah</Text>
              </View>
              <PressableScale onPress={() => router.push('/wallpaper')} style={styles.heroBtn}>
                <Text style={styles.heroBtnText}>Lainnya</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.gold} />
              </PressableScale>
            </LinearGradient>
          </View>
        ) : null}
      </Animated.View>

      {!doaQuery.isError ? (
        <View>
          <SectionHeader
            title="Doa Hari Ini"
            actionLabel="Lihat Semua"
            onAction={() => router.push('/doa-pilihan')}
          />
          {doaQuery.isLoading || !doaHariIni ? (
            <SkeletonBlock width="100%" height={168} radius={radius.xl} />
          ) : (
            <PressableScale onPress={() => router.push('/doa-pilihan')} style={styles.doaPress}>
              <View style={styles.doaCard}>
                <Text style={styles.doaTitle} numberOfLines={1}>
                  {doaHariIni.title}
                </Text>
                <ArabicText size={22} numberOfLines={2}>
                  {doaHariIni.arabic}
                </ArabicText>
                <Text style={styles.doaTranslation} numberOfLines={3}>
                  {doaHariIni.translation}
                </Text>
                {doaHariIni.source ? (
                  <Text style={styles.doaSource} numberOfLines={1}>
                    {doaHariIni.source}
                  </Text>
                ) : null}
              </View>
            </PressableScale>
          )}
        </View>
      ) : null}

      <SectionHeader
        title="Menu Cepat"
        actionLabel="Semua Fitur"
        onAction={() => router.push('/(tabs)/more')}
      />
      <View style={styles.menuGrid}>
        {QUICK_MENU.map((item, index) => (
          <View key={item.title} style={styles.menuTile}>
            <HomeTile
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              gradient={item.gradient}
              delay={index * 65}
              onPress={() => router.push(item.href)}
            />
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  headerTitles: {
    flex: 1,
  },
  salam: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.gold,
    letterSpacing: 0.4,
  },
  greeting: {
    fontFamily: font.extrabold,
    fontSize: 27,
    lineHeight: 34,
    color: colors.text,
    marginTop: 3,
  },
  dateText: {
    fontFamily: font.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 7,
  },
  hijriText: {
    fontFamily: font.regular,
    fontSize: 12,
    color: colors.textFaint,
    marginTop: 1,
  },
  headerBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  prayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  prayerIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerInfo: {
    flex: 1,
  },
  prayerLabel: {
    fontFamily: font.semibold,
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
    marginTop: 3,
  },
  prayerName: {
    fontFamily: font.extrabold,
    fontSize: 22,
    color: colors.text,
  },
  prayerTime: {
    fontFamily: font.bold,
    fontSize: 22,
    color: colors.gold,
  },
  prayerCountdown: {
    fontFamily: font.regular,
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.72)',
    marginTop: 3,
  },
  heroSection: {
    marginTop: spacing.md,
  },
  heroCard: {
    height: 180,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroTitles: {
    flex: 1,
  },
  heroTitle: {
    fontFamily: font.bold,
    fontSize: 16,
    color: colors.white,
  },
  heroSub: {
    fontFamily: font.regular,
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: 'rgba(10,21,18,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroBtnText: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.gold,
  },
  doaPress: {
    borderRadius: radius.xl,
  },
  doaCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  doaTitle: {
    fontFamily: font.bold,
    fontSize: 15,
    color: colors.gold,
  },
  doaTranslation: {
    fontFamily: font.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textMuted,
  },
  doaSource: {
    fontFamily: font.regular,
    fontSize: 11,
    color: colors.textFaint,
    marginTop: 2,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  menuTile: {
    width: '47.5%',
  },
});

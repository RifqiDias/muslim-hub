import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { HomeTile } from '@/components/home-tile';
import { ArabicText } from '@/components/ui/arabic-text';
import { ErrorState } from '@/components/ui/error-state';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { SkeletonBlock } from '@/components/ui/skeleton';
import { registerStrings, useLang, type I18n } from '@/i18n';
import { getDoaPilihan, getMyQuranJadwal } from '@/lib/api';
import { mapTimings, Timings, zonaDate, zonaHijri } from '@/lib/jadwal';
import { useZonaTime, zonaMinutesOfDay } from '@/lib/use-zona-time';
import { getJSON, StorageKeys } from '@/lib/storage';
import { MyQuranCity } from '@/lib/types';
import { ThemeColors, font, radius, spacing, useTheme } from '@/theme';

registerStrings('home', {
  salam: "Assalamu'alaikum",
  morning: 'Selamat pagi',
  afternoon: 'Selamat siang',
  evening: 'Selamat sore',
  night: 'Selamat malam',
  nextPrayer: 'Shalat berikutnya',
  remainingNow: 'waktunya telah tiba',
  remainingMinutes: '{m} menit lagi',
  remainingHours: '{h} jam lagi',
  remainingHm: '{h} jam {m} menit lagi',
  prayerError: 'Jadwal shalat gagal dimuat.',
  dailyDua: 'Doa Hari Ini',
  quickMenu: 'Menu Cepat',
  allFeatures: 'Semua Fitur',
  prayerFajr: 'Subuh',
  prayerDhuhr: 'Dzuhur',
  prayerAsr: 'Ashar',
  prayerMaghrib: 'Maghrib',
  prayerIsha: 'Isya',
  menuQuran: "Qur'an",
  menuQuranSub: 'Mushaf & terjemahan',
  menuJadwal: 'Jadwal Shalat',
  menuJadwalSub: 'Waktu shalat harian',
  menuDzikir: 'Dzikir',
  menuDzikirSub: 'Pagi & petang',
  menuHadits: 'Hadits',
  menuHaditsSub: 'Kutipan sahih',
  menuAsmaul: 'Asmaul Husna',
  menuAsmaulSub: '99 nama Allah',
  menuKisah: 'Kisah Nabi',
  menuKisahSub: '25 nabi & rasul',
  menuAi: 'Tanya AI',
  menuAiSub: 'Qalbun AI',
  menuAll: 'Semua',
  menuAllSub: 'Lihat semua fitur',
}, {
  salam: "Assalamu'alaikum",
  morning: 'Good morning',
  afternoon: 'Good afternoon',
  evening: 'Good evening',
  night: 'Good night',
  nextPrayer: 'Next prayer',
  remainingNow: 'the time has come',
  remainingMinutes: '{m}m left',
  remainingHours: '{h}h left',
  remainingHm: '{h}h {m}m left',
  prayerError: 'Failed to load prayer times.',
  dailyDua: 'Daily Dua',
  quickMenu: 'Quick Menu',
  allFeatures: 'All Features',
  prayerFajr: 'Fajr',
  prayerDhuhr: 'Dhuhr',
  prayerAsr: 'Asr',
  prayerMaghrib: 'Maghrib',
  prayerIsha: 'Isha',
  menuQuran: "Qur'an",
  menuQuranSub: 'Mushaf & translation',
  menuJadwal: 'Prayer Times',
  menuJadwalSub: 'Daily prayer times',
  menuDzikir: 'Dhikr',
  menuDzikirSub: 'Morning & evening',
  menuHadits: 'Hadith',
  menuHaditsSub: 'Authentic quotes',
  menuAsmaul: 'Asmaul Husna',
  menuAsmaulSub: '99 names of Allah',
  menuKisah: 'Prophet Stories',
  menuKisahSub: '25 prophets & messengers',
  menuAi: 'Ask AI',
  menuAiSub: 'Qalbun AI',
  menuAll: 'All',
  menuAllSub: 'Browse all features',
});

const PRAYER_ORDER: { key: keyof Timings; labelPath: string }[] = [
  { key: 'Fajr', labelPath: 'home.prayerFajr' },
  { key: 'Dhuhr', labelPath: 'home.prayerDhuhr' },
  { key: 'Asr', labelPath: 'home.prayerAsr' },
  { key: 'Maghrib', labelPath: 'home.prayerMaghrib' },
  { key: 'Isha', labelPath: 'home.prayerIsha' },
];

interface QuickMenuItem {
  titlePath: string;
  subtitlePath: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: 'emerald' | 'teal' | 'gold' | 'night' | 'plum';
  href: Href;
}

const QUICK_MENU: QuickMenuItem[] = [
  { titlePath: 'home.menuQuran', subtitlePath: 'home.menuQuranSub', icon: 'book', gradient: 'emerald', href: '/quran' },
  { titlePath: 'home.menuJadwal', subtitlePath: 'home.menuJadwalSub', icon: 'time', gradient: 'teal', href: '/jadwal' },
  { titlePath: 'home.menuDzikir', subtitlePath: 'home.menuDzikirSub', icon: 'moon', gradient: 'night', href: '/dzikir' },
  { titlePath: 'home.menuHadits', subtitlePath: 'home.menuHaditsSub', icon: 'newspaper', gradient: 'gold', href: '/hadith' },
  { titlePath: 'home.menuAsmaul', subtitlePath: 'home.menuAsmaulSub', icon: 'sparkles', gradient: 'plum', href: '/asmaul-husna' },
  { titlePath: 'home.menuKisah', subtitlePath: 'home.menuKisahSub', icon: 'people', gradient: 'emerald', href: '/kisah-nabi' },
  { titlePath: 'home.menuAi', subtitlePath: 'home.menuAiSub', icon: 'chatbubbles', gradient: 'night', href: '/ai' },
  { titlePath: 'home.menuAll', subtitlePath: 'home.menuAllSub', icon: 'grid', gradient: 'gold', href: '/more' },
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

function formatRemaining(minutes: number, t: I18n['t']): string {
  if (minutes <= 0) return t('home.remainingNow');
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return t('home.remainingMinutes', { m });
  if (m === 0) return t('home.remainingHours', { h });
  return t('home.remainingHm', { h, m });
}

function ThemeToggle() {
  const { scheme, toggle, colors } = useTheme();

  return (
    <PressableScale
      onPress={toggle}
      hitSlop={8}
      style={{
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Animated.View key={scheme} entering={ZoomIn.springify().duration(380)}>
        <Ionicons
          name={scheme === 'dark' ? 'sunny' : 'moon'}
          size={24}
          color={scheme === 'dark' ? '#F5D07A' : '#0E7A5F'}
        />
      </Animated.View>
    </PressableScale>
  );
}

export default function BerandaScreen() {
  const { t, lang } = useLang();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { zonaOffsetMs, zonaCityId } = useZonaTime();
  const [city, setCity] = useState<MyQuranCity | null>(null);
  const [cityLoaded, setCityLoaded] = useState(false);
  const [tick, setTick] = useState(0);
  const [dayIndex] = useState(() => Math.floor(Date.now() / 86400000));

  useEffect(() => {
    let active = true;
    getJSON<MyQuranCity>(StorageKeys.cityV2).then((stored) => {
      if (!active) return;
      setCity(stored);
      setCityLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 30000);
    return () => clearInterval(timer);
  }, []);

  const effectiveCityId = city?.id ?? zonaCityId;
  const dateKey = zonaDate(zonaOffsetMs).toISOString().slice(0, 10);

  const prayerQuery = useQuery({
    queryKey: ['myquran-jadwal', effectiveCityId, dateKey],
    queryFn: () => getMyQuranJadwal(effectiveCityId, dateKey),
    enabled: cityLoaded,
    staleTime: 1000 * 60 * 30,
  });

  const doaQuery = useQuery({ queryKey: ['doa-pilihan'], queryFn: getDoaPilihan });

  const minutesNow = zonaMinutesOfDay(zonaOffsetMs);
  const zonaHour = Math.floor(minutesNow / 60);

  const greeting = useMemo(() => {
    if (zonaHour >= 4 && zonaHour < 11) return t('home.morning');
    if (zonaHour >= 11 && zonaHour < 15) return t('home.afternoon');
    if (zonaHour >= 15 && zonaHour < 18) return t('home.evening');
    return t('home.night');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zonaHour, t, tick]);

  const gregorianText = useMemo(() => {
    const shifted = zonaDate(zonaOffsetMs);
    const asUtc = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(asUtc));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, tick, dateKey]);

  const hijriText = zonaHijri(zonaOffsetMs);

  const doaHariIni =
    doaQuery.data && doaQuery.data.length > 0
      ? doaQuery.data[dayIndex % doaQuery.data.length]
      : null;

  const nextPrayer = (() => {
    const raw = prayerQuery.data?.jadwal;
    if (!raw) return null;
    const timings = mapTimings(raw);
    for (const prayer of PRAYER_ORDER) {
      const parsed = parseHM(timings[prayer.key]);
      if (parsed !== null && parsed > minutesNow) {
        return { label: t(prayer.labelPath), minutes: parsed, remaining: parsed - minutesNow };
      }
    }
    const fajr = parseHM(timings.Fajr);
    if (fajr === null) return null;
    return { label: t('home.prayerFajr'), minutes: fajr, remaining: 1440 - minutesNow + fajr };
  })();

  const prayerFailed = prayerQuery.isError || (!prayerQuery.isLoading && !nextPrayer);

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown.duration(450)} style={styles.headerRow}>
        <View style={styles.headerTitles}>
          <Text style={styles.salam}>{t('home.salam')}</Text>
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.dateText}>{gregorianText}</Text>
          {hijriText ? <Text style={styles.hijriText}>{hijriText}</Text> : null}
        </View>
        <ThemeToggle />
      </Animated.View>

      {prayerFailed ? (
        <ErrorState message={t('home.prayerError')} onRetry={() => prayerQuery.refetch()} />
      ) : nextPrayer ? (
        <PressableScale onPress={() => router.push('/jadwal')} style={styles.prayerPress}>
          <Animated.View entering={FadeInDown.duration(450).delay(90)}>
            <View style={styles.prayerCard}>
              <View style={styles.prayerIcon}>
                <Ionicons name="time" size={26} color={colors.gold} />
              </View>
              <View style={styles.prayerInfo}>
                <Text style={styles.prayerLabel}>{t('home.nextPrayer')}</Text>
                <View style={styles.prayerRow}>
                  <Text style={styles.prayerName}>{nextPrayer.label}</Text>
                  <Text style={styles.prayerTime}>{formatHM(nextPrayer.minutes)}</Text>
                </View>
                <Text style={styles.prayerCountdown}>{formatRemaining(nextPrayer.remaining, t)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
            </View>
          </Animated.View>
        </PressableScale>
      ) : (
        <SkeletonBlock width="100%" height={118} radius={radius.xl} />
       )}

      {!doaQuery.isError ? (
        <View>
          <SectionHeader
            title={t('home.dailyDua')}
            actionLabel={t('common.seeAll')}
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
        title={t('home.quickMenu')}
        actionLabel={t('home.allFeatures')}
        onAction={() => router.push('/more')}
      />
      <View style={styles.menuGrid}>
        {QUICK_MENU.map((item, index) => (
          <View key={item.titlePath} style={styles.menuTile}>
            <HomeTile
              title={t(item.titlePath)}
              subtitle={t(item.subtitlePath)}
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

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
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
      color: c.gold,
      letterSpacing: 0.4,
    },
    greeting: {
      fontFamily: font.extrabold,
      fontSize: 27,
      lineHeight: 34,
      color: c.text,
      marginTop: 3,
    },
    dateText: {
      fontFamily: font.regular,
      fontSize: 13,
      color: c.textMuted,
      marginTop: 7,
    },
    hijriText: {
      fontFamily: font.regular,
      fontSize: 12,
      color: c.textFaint,
      marginTop: 1,
    },
    toggleBtn: {
      width: 54,
      height: 54,
      borderRadius: 27,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    prayerPress: {
      borderRadius: radius.xl,
    },
    prayerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.lg,
      borderRadius: radius.xl,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    prayerIcon: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    prayerInfo: {
      flex: 1,
    },
    prayerLabel: {
      fontFamily: font.semibold,
      fontSize: 11.5,
      color: c.textMuted,
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
      color: c.text,
    },
    prayerTime: {
      fontFamily: font.bold,
      fontSize: 22,
      color: c.gold,
    },
    prayerCountdown: {
      fontFamily: font.regular,
      fontSize: 12.5,
      color: c.textMuted,
      marginTop: 3,
    },
    doaPress: {
      borderRadius: radius.xl,
    },
    doaCard: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.xl,
      padding: spacing.lg,
      gap: spacing.sm,
    },
    doaTitle: {
      fontFamily: font.bold,
      fontSize: 15,
      color: c.gold,
    },
    doaTranslation: {
      fontFamily: font.regular,
      fontSize: 13,
      lineHeight: 19,
      color: c.textMuted,
    },
    doaSource: {
      fontFamily: font.regular,
      fontSize: 11,
      color: c.textFaint,
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

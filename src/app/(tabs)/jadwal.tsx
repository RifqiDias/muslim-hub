import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { ComponentProps, useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SearchBar } from '@/components/ui/search-bar';
import { SkeletonList } from '@/components/ui/skeleton';
import { registerStrings, useLang } from '@/i18n';
import { getMyQuranCities, getMyQuranJadwal } from '@/lib/api';
import { mapTimings, Timings, titleCaseWords, zonaDateKey, zonaHijri } from '@/lib/jadwal';
import { getJSON, removeItem, setJSON, StorageKeys } from '@/lib/storage';
import { useZonaTime, zonaMinutesOfDay, zonaSecondsOfDay } from '@/lib/use-zona-time';
import { MyQuranCity } from '@/lib/types';
import { font, radius, shadow, spacing, ThemeColors, useTheme } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type ScheduleKey = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

registerStrings('jadwal', {
  title: 'Jadwal Shalat',
  subtitle: 'Waktu shalat hari ini',
  nextBadge: 'WAKTU BERIKUTNYA',
  untilCaption: 'menuju waktu {name}',
  autoLocation: 'Lokasi Otomatis',
  chooseCity: 'Pilih Kota',
  chooseCitySubtitle: 'Jadwal shalat akan mengikuti kota terpilih',
  searchCity: 'Cari kota...',
  autoOption: 'Lokasi otomatis',
  autoOptionHint: 'Deteksi via alamat IP',
  cityNotFound: 'Kota tidak ditemukan',
  gregorian: 'Masehi',
  hijri: 'Hijriah',
  next: 'BERIKUTNYA',
  timeImsak: 'Imsak',
  timeFajr: 'Subuh',
  timeSunrise: 'Terbit',
  timeDhuhr: 'Dzuhur',
  timeAsr: 'Ashar',
  timeMaghrib: 'Maghrib',
  timeIsha: 'Isya',
}, {
  title: 'Prayer Times',
  subtitle: 'Today’s prayer times',
  nextBadge: 'NEXT PRAYER',
  untilCaption: 'until {name}',
  autoLocation: 'Auto Location',
  chooseCity: 'Choose City',
  chooseCitySubtitle: 'Prayer times will follow the selected city',
  searchCity: 'Search city...',
  autoOption: 'Auto location',
  autoOptionHint: 'IP detection',
  cityNotFound: 'City not found',
  gregorian: 'Gregorian',
  hijri: 'Hijri',
  next: 'NEXT',
  timeImsak: 'Imsak',
  timeFajr: 'Subuh',
  timeSunrise: 'Sunrise',
  timeDhuhr: 'Dzuhur',
  timeAsr: 'Ashar',
  timeMaghrib: 'Maghrib',
  timeIsha: 'Isha',
});

const NEXT_SEQUENCE: { key: ScheduleKey; label: string }[] = [
  { key: 'Fajr', label: 'timeFajr' },
  { key: 'Sunrise', label: 'timeSunrise' },
  { key: 'Dhuhr', label: 'timeDhuhr' },
  { key: 'Asr', label: 'timeAsr' },
  { key: 'Maghrib', label: 'timeMaghrib' },
  { key: 'Isha', label: 'timeIsha' },
];

const TIME_ITEMS: { key: keyof Timings; label: string; icon: IoniconName }[] = [
  { key: 'Imsak', label: 'timeImsak', icon: 'moon-outline' },
  { key: 'Fajr', label: 'timeFajr', icon: 'moon' },
  { key: 'Sunrise', label: 'timeSunrise', icon: 'partly-sunny-outline' },
  { key: 'Dhuhr', label: 'timeDhuhr', icon: 'sunny-outline' },
  { key: 'Asr', label: 'timeAsr', icon: 'partly-sunny' },
  { key: 'Maghrib', label: 'timeMaghrib', icon: 'moon' },
  { key: 'Isha', label: 'timeIsha', icon: 'cloudy-night-outline' },
];

const HERO_ORNAMENT: Record<ScheduleKey, IoniconName> = {
  Fajr: 'moon',
  Sunrise: 'sunny',
  Dhuhr: 'sunny',
  Asr: 'partly-sunny',
  Maghrib: 'moon',
  Isha: 'cloudy-night',
};

interface NextSchedule {
  key: ScheduleKey;
  label: string;
  time: string;
  targetMinutes: number;
  dayOffset: number;
}

function toMinutes(time: string): number {
  const [h, m] = time.split(':');
  return parseInt(h, 10) * 60 + parseInt(m, 10);
}

function formatTime(time: string): string {
  return time.split(' ')[0];
}

function CountdownClock({
  targetMinutes,
  dayOffset,
  zonaOffsetMs,
  onExpire,
}: {
  targetMinutes: number;
  dayOffset: number;
  zonaOffsetMs: number;
  onExpire: () => void;
}) {
  const { colors, scheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors, scheme), [colors, scheme]);
  const [nowSeconds, setNowSeconds] = useState(() => zonaSecondsOfDay(zonaOffsetMs));

  useEffect(() => {
    const id = setInterval(() => setNowSeconds(zonaSecondsOfDay(zonaOffsetMs)), 1000);
    return () => clearInterval(id);
  }, [zonaOffsetMs]);

  const remaining = Math.max(targetMinutes * 60 + dayOffset * 86400 - nowSeconds, 0);

  useEffect(() => {
    if (dayOffset === 0 && remaining === 0) onExpire();
  }, [remaining, dayOffset, onExpire]);

  const hh = String(Math.floor(remaining / 3600)).padStart(2, '0');
  const mm = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');

  return (
    <Text style={styles.heroClock} allowFontScaling={false}>
      {hh}
      <Text style={styles.heroClockSep}>:</Text>
      {mm}
      <Text style={styles.heroClockSep}>:</Text>
      {ss}
    </Text>
  );
}

function HeroCard({
  schedule,
  cityName,
  zonaOffsetMs,
  onExpire,
  onOpenCity,
}: {
  schedule: NextSchedule;
  cityName: string;
  zonaOffsetMs: number;
  onExpire: () => void;
  onOpenCity: () => void;
}) {
  const { colors, gradients, scheme } = useTheme();
  const { t } = useLang();
  const styles = useMemo(() => makeStyles(colors, scheme), [colors, scheme]);
  const onGradient = scheme === 'dark' ? '#061009' : '#FFFFFF';

  return (
    <Animated.View entering={FadeInDown.duration(450)}>
      <LinearGradient
        colors={[...gradients.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroDeco} pointerEvents="none">
          <Ionicons name={HERO_ORNAMENT[schedule.key]} size={190} color={onGradient} />
        </View>
        <View style={styles.heroTop}>
          <View style={styles.heroBadge}>
            <View style={styles.heroBadgeDot} />
            <Text style={styles.heroBadgeText}>{t('jadwal.nextBadge')}</Text>
          </View>
          <PressableScale onPress={onOpenCity} style={styles.heroCity} scaleTo={0.96}>
            <Ionicons name="location" size={12} color={onGradient} />
            <Text style={[styles.heroCityText, { color: onGradient }]} numberOfLines={1}>
              {cityName}
            </Text>
            <Ionicons name="chevron-down" size={12} color={onGradient} />
          </PressableScale>
        </View>
        <View style={styles.heroBody}>
          <Text style={[styles.heroName, { color: onGradient }]}>{t(`jadwal.${schedule.label}`)}</Text>
          <Text style={[styles.heroTime, { color: onGradient }]} allowFontScaling={false}>
            {formatTime(schedule.time)}
          </Text>
        </View>
        <CountdownClock
          targetMinutes={schedule.targetMinutes}
          dayOffset={schedule.dayOffset}
          zonaOffsetMs={zonaOffsetMs}
          onExpire={onExpire}
        />
        <Text style={[styles.heroCaption, { color: onGradient }]}>
          {t('jadwal.untilCaption', { name: t(`jadwal.${schedule.label}`) })}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}

function Timeline({
  schedule,
  timings,
}: {
  schedule: NextSchedule;
  timings: Timings;
}) {
  const { colors, scheme } = useTheme();
  const { t } = useLang();
  const styles = useMemo(() => makeStyles(colors, scheme), [colors, scheme]);

  return (
    <Animated.View entering={FadeInDown.delay(90).duration(450)} style={styles.timelineWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.timelineContent}
      >
        {TIME_ITEMS.map((item) => {
          const active = schedule.key === item.key;
          return (
            <View key={item.key} style={[styles.pill, active && styles.pillActive]}>
              <Ionicons name={item.icon} size={17} color={active ? colors.primary : colors.gold} />
              <Text style={[styles.pillLabel, active && styles.pillLabelActive]} numberOfLines={1}>
                {t(`jadwal.${item.label}`)}
              </Text>
              <Text style={styles.pillTime} allowFontScaling={false}>
                {formatTime(timings[item.key])}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

function DateCard({ gregorianText, hijriText }: { gregorianText: string; hijriText: string }) {
  const { colors, scheme } = useTheme();
  const { t } = useLang();
  const styles = useMemo(() => makeStyles(colors, scheme), [colors, scheme]);

  return (
    <Animated.View entering={FadeInDown.delay(150).duration(450)} style={styles.dateCard}>
      <View style={styles.dateCol}>
        <View style={styles.dateLabelRow}>
          <Ionicons name="calendar-outline" size={12} color={colors.textMuted} />
          <Text style={styles.dateLabel}>{t('jadwal.gregorian')}</Text>
        </View>
        <Text style={styles.dateValue} numberOfLines={1}>
          {gregorianText || '-'}
        </Text>
      </View>
      <View style={styles.dateDivider} />
      <View style={[styles.dateCol, styles.dateColRight]}>
        <View style={styles.dateLabelRow}>
          <Ionicons name="moon-outline" size={12} color={colors.gold} />
          <Text style={styles.dateLabelHijri}>{t('jadwal.hijri')}</Text>
        </View>
        <Text style={styles.dateValueHijri} numberOfLines={1}>
          {hijriText ? `${hijriText} H` : '-'}
        </Text>
      </View>
    </Animated.View>
  );
}

function TimeRow({
  label,
  icon,
  time,
  highlighted,
  index,
}: {
  label: string;
  icon: IoniconName;
  time: string;
  highlighted: boolean;
  index: number;
}) {
  const { colors, scheme } = useTheme();
  const { t } = useLang();
  const styles = useMemo(() => makeStyles(colors, scheme), [colors, scheme]);

  return (
    <Animated.View
      entering={FadeInDown.delay(200 + index * 50).duration(450)}
      style={[styles.row, highlighted && styles.rowActive]}
    >
      <View style={[styles.rowIcon, highlighted && styles.rowIconActive]}>
        <Ionicons name={icon} size={18} color={highlighted ? colors.primary : colors.gold} />
      </View>
      <View style={styles.rowTitleRow}>
        <Text style={[styles.rowLabel, highlighted && styles.rowLabelActive]} numberOfLines={1}>
          {label}
        </Text>
        {highlighted ? (
          <View style={styles.rowBadge}>
            <Text style={styles.rowBadgeText}>{t('jadwal.next')}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.rowTime} allowFontScaling={false}>
        {formatTime(time)}
      </Text>
    </Animated.View>
  );
}

function CityOption({
  label,
  hint,
  active,
  icon,
  onPress,
}: {
  label: string;
  hint?: string;
  active: boolean;
  icon?: IoniconName;
  onPress: () => void;
}) {
  const { colors, scheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors, scheme), [colors, scheme]);

  return (
    <PressableScale
      onPress={onPress}
      style={[styles.option, active && styles.optionActive]}
      scaleTo={0.97}
    >
      {icon ? (
        <Ionicons name={icon} size={16} color={active ? colors.primary : colors.gold} />
      ) : null}
      <View style={styles.optionText}>
        <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{label}</Text>
        {hint ? <Text style={styles.optionHint}>{hint}</Text> : null}
      </View>
      {active ? <Ionicons name="checkmark" size={18} color={colors.primary} /> : null}
    </PressableScale>
  );
}

function CityModal({
  visible,
  current,
  cities,
  citiesLoading,
  onSelect,
  onClose,
}: {
  visible: boolean;
  current: MyQuranCity | null;
  cities: MyQuranCity[];
  citiesLoading: boolean;
  onSelect: (city: MyQuranCity | null) => void;
  onClose: () => void;
}) {
  const { colors, scheme } = useTheme();
  const { t } = useLang();
  const styles = useMemo(() => makeStyles(colors, scheme), [colors, scheme]);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return cities;
    return cities.filter((city) => city.lokasi.toLowerCase().includes(normalized));
  }, [cities, query]);

  const handleClose = () => {
    setQuery('');
    onClose();
  };

  const handleSelect = (city: MyQuranCity | null) => {
    setQuery('');
    onSelect(city);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <Pressable style={[StyleSheet.absoluteFill, styles.modalScrim]} onPress={handleClose} />
        <View style={styles.modalCard}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{t('jadwal.chooseCity')}</Text>
          <Text style={styles.modalSubtitle}>{t('jadwal.chooseCitySubtitle')}</Text>
          <SearchBar value={query} onChangeText={setQuery} placeholder={t('jadwal.searchCity')} />
          <ScrollView
            style={styles.modalList}
            contentContainerStyle={styles.modalListContent}
            showsVerticalScrollIndicator={false}
          >
            <CityOption
              icon="navigate"
              label={t('jadwal.autoOption')}
              hint={t('jadwal.autoOptionHint')}
              active={current === null}
              onPress={() => handleSelect(null)}
            />
            {citiesLoading ? (
              <Text style={styles.modalEmpty}>{t('common.loading')}</Text>
            ) : (
              filtered.map((city) => (
                <CityOption
                  key={city.id}
                  label={titleCaseWords(city.lokasi)}
                  active={current?.id === city.id}
                  onPress={() => handleSelect(city)}
                />
              ))
            )}
            {!citiesLoading && filtered.length === 0 ? (
              <Text style={styles.modalEmpty}>{t('jadwal.cityNotFound')}</Text>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function JadwalShalatScreen() {
  const { colors, scheme } = useTheme();
  const { t } = useLang();
  const styles = useMemo(() => makeStyles(colors, scheme), [colors, scheme]);
  const { zonaOffsetMs, zonaCityId } = useZonaTime();
  const [city, setCity] = useState<MyQuranCity | null>(null);
  const [cityLoaded, setCityLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [tick, setTick] = useState(0);

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

  const citiesQuery = useQuery({
    queryKey: ['myquran-cities'],
    queryFn: getMyQuranCities,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const effectiveCityId = city?.id ?? zonaCityId;
  const dateKey = zonaDateKey(zonaOffsetMs);

  const { data, isPending, isError, isRefetching, refetch } = useQuery({
    queryKey: ['myquran-jadwal', effectiveCityId, dateKey],
    queryFn: () => getMyQuranJadwal(effectiveCityId, dateKey),
    enabled: cityLoaded,
    staleTime: 1000 * 60 * 30,
  });

  const timings = useMemo(() => (data ? mapTimings(data.jadwal) : null), [data]);

  const handleExpire = useCallback(() => setTick((t) => t + 1), []);

  const schedule = useMemo<NextSchedule | null>(() => {
    if (!timings) return null;
    const nowMin = zonaMinutesOfDay(zonaOffsetMs);
    const next = NEXT_SEQUENCE.find((p) => toMinutes(timings[p.key]) > nowMin);
    if (next) {
      return {
        key: next.key,
        label: next.label,
        time: timings[next.key],
        targetMinutes: toMinutes(timings[next.key]),
        dayOffset: 0,
      };
    }
    return {
      key: 'Fajr',
      label: 'timeFajr',
      time: timings.Fajr,
      targetMinutes: toMinutes(timings.Fajr),
      dayOffset: 1,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timings, tick, zonaOffsetMs]);

  const selectCity = (next: MyQuranCity | null) => {
    setCity(next);
    setModalVisible(false);
    if (next === null) {
      removeItem(StorageKeys.cityV2);
    } else {
      setJSON(StorageKeys.cityV2, next);
    }
  };

  const cityName = city ? titleCaseWords(city.lokasi) : t('jadwal.autoLocation');

  return (
    <Screen scroll refreshing={isRefetching} onRefresh={() => refetch()}>
      <PageHeader
        back={false}
        title={t('jadwal.title')}
        subtitle={t('jadwal.subtitle')}
      />
      {isPending ? <SkeletonList count={4} height={120} /> : null}
      {isError ? <ErrorState onRetry={() => refetch()} /> : null}
      {data && timings && schedule ? (
        <>
          <HeroCard
            schedule={schedule}
            cityName={cityName}
            zonaOffsetMs={zonaOffsetMs}
            onExpire={handleExpire}
            onOpenCity={() => setModalVisible(true)}
          />
          <Timeline schedule={schedule} timings={timings} />
          <DateCard
            gregorianText={data.jadwal.tanggal}
            hijriText={zonaHijri(zonaOffsetMs)}
          />
          <View style={styles.list}>
            {TIME_ITEMS.map((item, index) => (
              <TimeRow
                key={item.key}
                label={t(`jadwal.${item.label}`)}
                icon={item.icon}
                time={timings[item.key]}
                highlighted={schedule.key === item.key}
                index={index}
              />
            ))}
          </View>
        </>
      ) : null}
      <CityModal
        visible={modalVisible}
        current={city}
        cities={citiesQuery.data ?? []}
        citiesLoading={citiesQuery.isPending}
        onSelect={selectCity}
        onClose={() => setModalVisible(false)}
      />
    </Screen>
  );
}

const makeStyles = (c: ThemeColors, scheme: 'light' | 'dark') =>
  StyleSheet.create({
    hero: {
      alignItems: 'center',
      borderRadius: radius.xl + 4,
      paddingVertical: spacing.xl + 4,
      paddingHorizontal: spacing.lg,
      overflow: 'hidden',
      ...shadow.card,
    },
    heroDeco: {
      position: 'absolute',
      right: -34,
      top: -30,
      opacity: 0.1,
    },
    heroTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      alignSelf: 'stretch',
      gap: spacing.sm,
    },
    heroBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderRadius: radius.full,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    heroBadgeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#FFFFFF',
    },
    heroBadgeText: {
      fontFamily: font.bold,
      fontSize: 9.5,
      letterSpacing: 1.5,
      color: '#FFFFFF',
    },
    heroCity: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(255,255,255,0.22)',
      borderRadius: radius.full,
      paddingLeft: 10,
      paddingRight: 8,
      paddingVertical: 5,
      maxWidth: 170,
    },
    heroCityText: {
      fontFamily: font.semibold,
      fontSize: 11,
    },
    heroBody: {
      alignItems: 'center',
      gap: 2,
      marginTop: spacing.lg,
    },
    heroName: {
      fontFamily: font.extrabold,
      fontSize: 30,
      lineHeight: 36,
    },
    heroTime: {
      fontFamily: font.semibold,
      fontSize: 16,
      letterSpacing: 1,
      opacity: 0.85,
      fontVariant: ['tabular-nums'],
    },
    heroClock: {
      fontFamily: font.extrabold,
      fontSize: 52,
      lineHeight: 62,
      marginTop: spacing.sm,
      fontVariant: ['tabular-nums'],
      letterSpacing: 2,
    },
    heroClockSep: {
      opacity: 0.45,
    },
    heroCaption: {
      fontFamily: font.regular,
      fontSize: 12,
      opacity: 0.78,
      marginTop: 2,
    },
    timelineWrap: {
      marginTop: spacing.md,
    },
    timelineContent: {
      gap: spacing.sm,
      paddingVertical: 2,
    },
    pill: {
      alignItems: 'center',
      gap: 4,
      minWidth: 88,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md - 1,
      borderRadius: radius.lg,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    pillActive: {
      borderColor: c.primary,
      backgroundColor: c.primarySoft,
      borderWidth: 1.5,
    },
    pillLabel: {
      fontFamily: font.regular,
      fontSize: 11,
      color: c.textMuted,
    },
    pillLabelActive: {
      fontFamily: font.semibold,
      color: c.primary,
    },
    pillTime: {
      fontFamily: font.semibold,
      fontSize: 14,
      color: c.text,
      fontVariant: ['tabular-nums'],
    },
    dateCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.lg,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.lg,
      padding: spacing.md,
      marginTop: spacing.md,
    },
    dateCol: {
      flex: 1,
      gap: 3,
    },
    dateColRight: {
      alignItems: 'flex-end',
    },
    dateDivider: {
      width: 1,
      alignSelf: 'stretch',
      backgroundColor: c.border,
    },
    dateLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dateLabel: {
      fontFamily: font.regular,
      fontSize: 11,
      color: c.textMuted,
    },
    dateLabelHijri: {
      fontFamily: font.regular,
      fontSize: 11,
      color: c.gold,
    },
    dateValue: {
      fontFamily: font.semibold,
      fontSize: 14,
      color: c.text,
    },
    dateValueHijri: {
      fontFamily: font.semibold,
      fontSize: 14,
      color: c.gold,
    },
    list: {
      gap: spacing.md,
      marginTop: spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.xl,
      paddingHorizontal: spacing.base,
      paddingVertical: spacing.md + 2,
    },
    rowActive: {
      borderColor: c.primary,
      backgroundColor: c.primarySoft,
      borderWidth: 1.5,
      ...shadow.card,
    },
    rowIcon: {
      width: 42,
      height: 42,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surfaceAlt,
    },
    rowIconActive: {
      backgroundColor: c.goldSoft,
      borderRadius: 16,
    },
    rowTitleRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    rowLabel: {
      fontFamily: font.semibold,
      fontSize: 15,
      color: c.text,
      flexShrink: 1,
    },
    rowLabelActive: {
      color: c.primary,
    },
    rowBadge: {
      backgroundColor: c.primary,
      borderRadius: radius.full,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    rowBadgeText: {
      fontFamily: font.bold,
      fontSize: 9,
      letterSpacing: 1,
      color: scheme === 'dark' ? '#061009' : '#FFFFFF',
    },
    rowTime: {
      fontFamily: font.extrabold,
      fontSize: 21,
      color: c.text,
      fontVariant: ['tabular-nums'],
    },
    modalBackdrop: {
      flex: 1,
      justifyContent: 'flex-end',
      padding: spacing.base,
      paddingBottom: spacing.xl,
    },
    modalScrim: {
      backgroundColor: c.black,
      opacity: 0.55,
    },
    modalCard: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.borderStrong,
      borderRadius: radius.xl,
      padding: spacing.lg,
      maxHeight: '82%',
    },
    modalHandle: {
      width: 36,
      height: 4,
      borderRadius: radius.full,
      backgroundColor: c.borderStrong,
      alignSelf: 'center',
      marginBottom: spacing.md,
    },
    modalTitle: {
      fontFamily: font.bold,
      fontSize: 18,
      color: c.text,
    },
    modalSubtitle: {
      fontFamily: font.regular,
      fontSize: 12,
      color: c.textMuted,
      marginTop: 2,
      marginBottom: spacing.md,
    },
    modalList: {
      flexGrow: 0,
      marginTop: spacing.md,
    },
    modalListContent: {
      gap: 4,
      paddingBottom: spacing.sm,
    },
    modalEmpty: {
      fontFamily: font.regular,
      fontSize: 13,
      color: c.textMuted,
      textAlign: 'center',
      paddingVertical: spacing.lg,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: 11,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
    },
    optionActive: {
      backgroundColor: c.primarySoft,
    },
    optionText: {
      flex: 1,
      gap: 1,
    },
    optionLabel: {
      fontFamily: font.semibold,
      fontSize: 14,
      color: c.text,
    },
    optionLabelActive: {
      color: c.primary,
    },
    optionHint: {
      fontFamily: font.regular,
      fontSize: 11,
      color: c.textMuted,
    },
  });

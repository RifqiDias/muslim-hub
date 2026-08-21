import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { ComponentProps, useCallback, useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SkeletonList } from '@/components/ui/skeleton';
import { getPrayerTimes } from '@/lib/api';
import { getString, removeItem, setString, StorageKeys } from '@/lib/storage';
import type { PrayerTimesData } from '@/lib/types';
import { colors, font, gradients, radius, shadow, spacing } from '@/theme';

type IoniconName = ComponentProps<typeof Ionicons>['name'];
type ScheduleKey = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

const CITIES = [
  'jakarta',
  'bandung',
  'surabaya',
  'medan',
  'makassar',
  'semarang',
  'palembang',
  'yogyakarta',
  'denpasar',
  'balikpapan',
  'aceh',
  'padang',
  'pekanbaru',
  'bogor',
  'tasikmalaya',
  'cirebon',
  'solo',
  'malang',
  'samarinda',
  'banjarmasin',
  'manado',
  'gorontalo',
  'kendari',
  'kupang',
  'ambon',
  'ternate',
  'jayapura',
  'sorong',
  'batam',
];

const NEXT_SEQUENCE: { key: ScheduleKey; label: string }[] = [
  { key: 'Fajr', label: 'Subuh' },
  { key: 'Sunrise', label: 'Terbit' },
  { key: 'Dhuhr', label: 'Dzuhur' },
  { key: 'Asr', label: 'Ashar' },
  { key: 'Maghrib', label: 'Maghrib' },
  { key: 'Isha', label: 'Isya' },
];

const GRID_ITEMS: { key: keyof PrayerTimesData['timings']; label: string; icon: IoniconName }[] = [
  { key: 'Imsak', label: 'Imsak', icon: 'moon-outline' },
  { key: 'Fajr', label: 'Subuh', icon: 'moon' },
  { key: 'Sunrise', label: 'Terbit', icon: 'partly-sunny-outline' },
  { key: 'Dhuhr', label: 'Dzuhur', icon: 'sunny-outline' },
  { key: 'Asr', label: 'Ashar', icon: 'partly-sunny' },
  { key: 'Maghrib', label: 'Maghrib', icon: 'moon' },
  { key: 'Isha', label: 'Isya', icon: 'cloudy-night-outline' },
  { key: 'Midnight', label: 'Tengah Malam', icon: 'time-outline' },
];

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

function secondsOfDay(date: Date): number {
  return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
}

function formatTime(time: string): string {
  return time.split(' ')[0];
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function CountdownClock({
  targetMinutes,
  dayOffset,
  onExpire,
}: {
  targetMinutes: number;
  dayOffset: number;
  onExpire: () => void;
}) {
  const [nowSeconds, setNowSeconds] = useState(() => secondsOfDay(new Date()));

  useEffect(() => {
    const id = setInterval(() => setNowSeconds(secondsOfDay(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

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

function CountdownCard({ schedule, onExpire }: { schedule: NextSchedule; onExpire: () => void }) {
  return (
    <Animated.View entering={FadeInDown.duration(450)}>
      <LinearGradient
        colors={[...gradients.emerald]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroDeco} pointerEvents="none">
          <Ionicons name="moon-outline" size={140} color="rgba(232,245,240,0.07)" />
        </View>
        <View style={styles.heroBadge}>
          <Ionicons name="time-outline" size={12} color={colors.gold} />
          <Text style={styles.heroBadgeText}>SELANJUTNYA</Text>
        </View>
        <Text style={styles.heroSchedule}>
          {schedule.label} · {formatTime(schedule.time)}
        </Text>
        <CountdownClock
          targetMinutes={schedule.targetMinutes}
          dayOffset={schedule.dayOffset}
          onExpire={onExpire}
        />
        <Text style={styles.heroCaption}>menuju waktu {schedule.label}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

function DateCards({ data }: { data: PrayerTimesData }) {
  const hijri = data.date?.hijri;
  const hijriText = hijri ? [hijri.day, hijri.month?.en, hijri.year].filter(Boolean).join(' ') : '';

  return (
    <View style={styles.dateRow}>
      <View style={styles.dateCard}>
        <Ionicons name="calendar-outline" size={16} color={colors.gold} />
        <Text style={styles.dateLabel}>Masehi</Text>
        <Text style={styles.dateValue} numberOfLines={1}>
          {data.date?.readable ?? '-'}
        </Text>
      </View>
      <View style={styles.dateCard}>
        <Ionicons name="moon-outline" size={16} color={colors.primary} />
        <Text style={styles.dateLabel}>Hijriah</Text>
        <Text style={styles.dateValue} numberOfLines={1}>
          {hijriText ? `${hijriText} H` : '-'}
        </Text>
      </View>
    </View>
  );
}

function TimeCard({
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
  return (
    <Animated.View
      entering={FadeInDown.delay(140 + index * 60).duration(450)}
      style={[styles.timeCard, highlighted && styles.timeCardActive]}
    >
      <View style={[styles.timeIconWrap, highlighted && styles.timeIconWrapActive]}>
        <Ionicons name={icon} size={18} color={highlighted ? colors.primary : colors.gold} />
      </View>
      <View style={styles.timeText}>
        <Text style={[styles.timeLabel, highlighted && styles.timeLabelActive]} numberOfLines={1}>
          {label}
        </Text>
        <Text style={styles.timeValue} allowFontScaling={false}>
          {formatTime(time)}
        </Text>
      </View>
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
  onSelect,
  onClose,
}: {
  visible: boolean;
  current: string | null;
  onSelect: (city: string | null) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View entering={FadeIn.duration(250)} style={styles.modalCard}>
          <Text style={styles.modalTitle}>Pilih Kota</Text>
          <Text style={styles.modalSubtitle}>Jadwal shalat akan mengikuti kota terpilih</Text>
          <ScrollView
            style={styles.modalList}
            contentContainerStyle={styles.modalListContent}
            showsVerticalScrollIndicator={false}
          >
            <CityOption
              icon="navigate"
              label="Lokasi otomatis"
              hint="Deteksi via alamat IP"
              active={current === null}
              onPress={() => onSelect(null)}
            />
            {CITIES.map((city) => (
              <CityOption
                key={city}
                label={capitalize(city)}
                active={current === city}
                onPress={() => onSelect(city)}
              />
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function JadwalShalatScreen() {
  const [city, setCity] = useState<string | null>(null);
  const [cityLoaded, setCityLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let active = true;
    getString(StorageKeys.city).then((stored) => {
      if (!active) return;
      setCity(stored);
      setCityLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const { data, isPending, isError, isRefetching, refetch } = useQuery({
    queryKey: ['prayer-times', city],
    queryFn: () => getPrayerTimes(city ? { city } : undefined),
    enabled: cityLoaded,
  });

  const handleExpire = useCallback(() => setTick((t) => t + 1), []);

  const schedule = useMemo<NextSchedule | null>(() => {
    if (!data) return null;
    const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
    const next = NEXT_SEQUENCE.find((p) => toMinutes(data.timings[p.key]) > nowMin);
    if (next) {
      return {
        key: next.key,
        label: next.label,
        time: data.timings[next.key],
        targetMinutes: toMinutes(data.timings[next.key]),
        dayOffset: 0,
      };
    }
    return {
      key: 'Fajr',
      label: 'Subuh',
      time: data.timings.Fajr,
      targetMinutes: toMinutes(data.timings.Fajr),
      dayOffset: 1,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, tick]);

  const selectCity = (next: string | null) => {
    setCity(next);
    setModalVisible(false);
    if (next === null) {
      removeItem(StorageKeys.city);
    } else {
      setString(StorageKeys.city, next);
    }
  };

  return (
    <Screen
      scroll
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={() => refetch()}
          tintColor={colors.primary}
          colors={[colors.primary]}
          progressBackgroundColor={colors.surface}
        />
      }
    >
      <PageHeader back={false} title="Jadwal Shalat" subtitle="Waktu shalat hari ini" />
      <PressableScale onPress={() => setModalVisible(true)} style={styles.cityBar}>
        <Ionicons name="location-sharp" size={15} color={colors.gold} />
        <Text style={styles.cityText} numberOfLines={1}>
          {city ? capitalize(city) : 'Lokasi Otomatis (IP)'}
        </Text>
        <Ionicons name="chevron-down" size={15} color={colors.textMuted} />
      </PressableScale>
      {isPending ? <SkeletonList count={4} height={120} /> : null}
      {isError ? <ErrorState onRetry={() => refetch()} /> : null}
      {data && schedule ? (
        <>
          <CountdownCard schedule={schedule} onExpire={handleExpire} />
          <DateCards data={data} />
          <View style={styles.grid}>
            {GRID_ITEMS.map((item, index) => (
              <TimeCard
                key={item.key}
                label={item.label}
                icon={item.icon}
                time={data.timings[item.key]}
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
        onSelect={selectCity}
        onClose={() => setModalVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingLeft: spacing.md,
    paddingRight: spacing.md,
    paddingVertical: 9,
    marginBottom: spacing.md,
  },
  cityText: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.text,
  },
  hero: {
    alignItems: 'center',
    borderRadius: radius.xl,
    padding: spacing.xl,
    overflow: 'hidden',
    ...shadow.card,
  },
  heroDeco: {
    position: 'absolute',
    right: -20,
    top: -16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.goldSoft,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  heroBadgeText: {
    fontFamily: font.bold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.gold,
  },
  heroSchedule: {
    fontFamily: font.bold,
    fontSize: 17,
    color: colors.text,
    marginTop: spacing.sm,
  },
  heroClock: {
    fontFamily: font.extrabold,
    fontSize: 52,
    lineHeight: 62,
    color: colors.white,
    marginTop: spacing.xs,
    fontVariant: ['tabular-nums'],
  },
  heroClockSep: {
    fontFamily: font.extrabold,
    color: colors.primary,
    opacity: 0.85,
  },
  heroCaption: {
    fontFamily: font.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  dateCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 3,
  },
  dateLabel: {
    fontFamily: font.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  dateValue: {
    fontFamily: font.semibold,
    fontSize: 14,
    color: colors.text,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  timeCard: {
    width: '48.4%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  timeCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  timeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  timeIconWrapActive: {
    backgroundColor: colors.goldSoft,
  },
  timeText: {
    flex: 1,
  },
  timeLabel: {
    fontFamily: font.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  timeLabelActive: {
    color: colors.primary,
    fontFamily: font.semibold,
  },
  timeValue: {
    fontFamily: font.extrabold,
    fontSize: 18,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(4,12,9,0.78)',
    justifyContent: 'flex-end',
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.xl,
    padding: spacing.lg,
    maxHeight: '82%',
  },
  modalTitle: {
    fontFamily: font.bold,
    fontSize: 18,
    color: colors.text,
  },
  modalSubtitle: {
    fontFamily: font.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  modalList: {
    flexGrow: 0,
  },
  modalListContent: {
    gap: 4,
    paddingBottom: spacing.sm,
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
    backgroundColor: colors.primarySoft,
  },
  optionText: {
    flex: 1,
    gap: 1,
  },
  optionLabel: {
    fontFamily: font.semibold,
    fontSize: 14,
    color: colors.text,
  },
  optionLabelActive: {
    color: colors.primary,
  },
  optionHint: {
    fontFamily: font.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
});

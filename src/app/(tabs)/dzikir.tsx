import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FeatureCard } from '@/components/ui/feature-card';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { registerStrings, useLang } from '@/i18n';
import { font, radius, spacing, useTheme, type ThemeColors } from '@/theme';

registerStrings('dzikirHub', {
  title: 'Dzikir',
  greetingMorning: 'Selamat pagi, awali hari dengan dzikir pagi',
  greetingEvening: 'Selamat petang, tutup hari dengan dzikir petang',
  recommendChip: 'Waktunya',
  othersTitle: 'Bacaan Lainnya',
  pagiTitle: 'Dzikir Pagi',
  pagiSubtitle: 'Dibaca pada waktu pagi, sejak terbit fajar hingga menjelang dzuhur',
  petangTitle: 'Dzikir Petang',
  petangSubtitle: 'Dibaca pada waktu petang, sejak Ashar hingga malam hari',
  setelahShalatTitle: 'Setelah Shalat',
  setelahShalatSubtitle: 'Dibaca setiap selesai melaksanakan shalat fardhu',
  wiridTitle: 'Wirid & Tasbih',
  wiridSubtitle: 'Hitung wirid dengan tasbih digital',
  tahlilTitle: 'Tahlil',
  tahlilSubtitle: 'Bacaan tahlil lengkap',
  doaHarianTitle: 'Doa Harian',
  doaHarianSubtitle: 'Doa untuk aktivitas sehari-hari',
  doaPilihanTitle: 'Doa Pilihan',
  doaPilihanSubtitle: 'Kumpulan doa pilihan berpahala',
}, {
  title: 'Dhikr',
  greetingMorning: 'Good morning, start your day with morning dhikr',
  greetingEvening: 'Good evening, end your day with evening dhikr',
  recommendChip: 'It’s time',
  othersTitle: 'More Recitations',
  pagiTitle: 'Morning Dhikr',
  pagiSubtitle: 'Recited in the morning, from dawn until midday',
  petangTitle: 'Evening Dhikr',
  petangSubtitle: 'Recited in the evening, from late afternoon until night',
  setelahShalatTitle: 'After Prayer',
  setelahShalatSubtitle: 'Recited after every obligatory prayer',
  wiridTitle: 'Wirid & Tasbih',
  wiridSubtitle: 'Count your wirid with a digital tasbih',
  tahlilTitle: 'Tahlil',
  tahlilSubtitle: 'The complete tahlil recitation',
  doaHarianTitle: 'Daily Duas',
  doaHarianSubtitle: 'Duas for everyday activities',
  doaPilihanTitle: 'Selected Duas',
  doaPilihanSubtitle: 'A collection of rewarding selected duas',
});

interface DzikirMode {
  type: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: 'gold' | 'night' | 'emerald';
  time: 'pagi' | 'petang';
}

const MODES: DzikirMode[] = [
  {
    type: 'pagi',
    label: 'pagi',
    icon: 'sunny',
    gradient: 'gold',
    time: 'pagi',
  },
  {
    type: 'petang',
    label: 'petang',
    icon: 'moon',
    gradient: 'night',
    time: 'petang',
  },
  {
    type: 'setelah-shalat',
    label: 'setelahShalat',
    icon: 'checkmark-circle',
    gradient: 'emerald',
    time: 'pagi',
  },
];

const OTHERS = [
  {
    href: '/wirid',
    label: 'wirid',
    icon: 'repeat',
    gradient: 'teal',
  },
  {
    href: '/tahlil',
    label: 'tahlil',
    icon: 'hand-left-outline',
    gradient: 'night',
  },
  {
    href: '/doa-harian',
    label: 'doaHarian',
    icon: 'sunny-outline',
    gradient: 'plum',
  },
  {
    href: '/doa-pilihan',
    label: 'doaPilihan',
    icon: 'star-outline',
    gradient: 'gold',
  },
] as const;

export default function DzikirHubScreen() {
  const { t } = useLang();
  const { colors, gradients, scheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const iconWrapBg = scheme === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.55)';

  const isMorning = useMemo(() => new Date().getHours() < 15, []);

  const openMode = (type: string) => {
    router.push({ pathname: '/dzikir/[type]', params: { type } });
  };

  return (
    <Screen scroll>
      <PageHeader
        back={false}
        title={t('dzikirHub.title')}
        subtitle={isMorning ? t('dzikirHub.greetingMorning') : t('dzikirHub.greetingEvening')}
      />

      {MODES.map((mode, index) => {
        const recommended = (isMorning && mode.time === 'pagi') || (!isMorning && mode.time === 'petang');
        return (
          <Animated.View key={mode.type} entering={FadeInDown.springify().delay(index * 110)}>
            <PressableScale onPress={() => openMode(mode.type)} style={styles.modePress}>
              <LinearGradient
                colors={[...gradients[mode.gradient]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modeCard}
              >
                <View style={[styles.modeIconWrap, { backgroundColor: iconWrapBg }]}>
                  <Ionicons name={mode.icon} size={30} color={colors.gold} />
                </View>
                <View style={styles.modeTextWrap}>
                  <View style={styles.modeTitleRow}>
                    <Text style={styles.modeTitle}>{t(`dzikirHub.${mode.label}Title`)}</Text>
                    {recommended ? <View style={styles.recommendChip}><Text style={styles.recommendText}>{t('dzikirHub.recommendChip')}</Text></View> : null}
                  </View>
                  <Text style={styles.modeSubtitle} numberOfLines={2}>
                    {t(`dzikirHub.${mode.label}Subtitle`)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </LinearGradient>
            </PressableScale>
          </Animated.View>
        );
      })}

      <SectionHeader title={t('dzikirHub.othersTitle')} />
      {OTHERS.map((item, index) => (
        <FeatureCard
          key={item.href}
          title={t(`dzikirHub.${item.label}Title`)}
          subtitle={t(`dzikirHub.${item.label}Subtitle`)}
          icon={item.icon}
          gradient={item.gradient}
          onPress={() => router.push(item.href)}
          delay={index * 90}
        />
      ))}
    </Screen>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    modePress: {
      borderRadius: radius.xl,
      marginBottom: spacing.md,
    },
    modeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.base,
      padding: spacing.lg,
      borderRadius: radius.xl,
      borderWidth: 1,
      borderColor: c.border,
    },
    modeIconWrap: {
      width: 58,
      height: 58,
      borderRadius: 29,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modeTextWrap: {
      flex: 1,
    },
    modeTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    modeTitle: {
      fontFamily: font.bold,
      fontSize: 17,
      color: c.text,
    },
    recommendChip: {
      backgroundColor: c.primarySoft,
      borderWidth: 1,
      borderColor: c.primary,
      borderRadius: radius.full,
      paddingHorizontal: spacing.sm + 2,
      paddingVertical: 2,
    },
    recommendText: {
      fontFamily: font.semibold,
      fontSize: 10,
      color: c.primary,
    },
    modeSubtitle: {
      fontFamily: font.regular,
      fontSize: 12,
      lineHeight: 17,
      color: c.textMuted,
      marginTop: 3,
    },
  });

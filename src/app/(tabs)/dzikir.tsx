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
import { font, radius, spacing, useTheme, type ThemeColors } from '@/theme';

interface DzikirMode {
  type: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: 'gold' | 'night' | 'emerald';
  time: 'pagi' | 'petang';
}

const MODES: DzikirMode[] = [
  {
    type: 'pagi',
    title: 'Dzikir Pagi',
    subtitle: 'Dibaca pada waktu pagi, sejak terbit fajar hingga menjelang dzuhur',
    icon: 'sunny',
    gradient: 'gold',
    time: 'pagi',
  },
  {
    type: 'petang',
    title: 'Dzikir Petang',
    subtitle: 'Dibaca pada waktu petang, sejak Ashar hingga malam hari',
    icon: 'moon',
    gradient: 'night',
    time: 'petang',
  },
  {
    type: 'setelah-shalat',
    title: 'Setelah Shalat',
    subtitle: 'Dibaca setiap selesai melaksanakan shalat fardhu',
    icon: 'checkmark-circle',
    gradient: 'emerald',
    time: 'pagi',
  },
];

const OTHERS = [
  {
    href: '/wirid',
    title: 'Wirid & Tasbih',
    subtitle: 'Hitung wirid dengan tasbih digital',
    icon: 'repeat',
    gradient: 'teal',
  },
  {
    href: '/tahlil',
    title: 'Tahlil',
    subtitle: 'Bacaan tahlil lengkap',
    icon: 'hand-left-outline',
    gradient: 'night',
  },
  {
    href: '/doa-harian',
    title: 'Doa Harian',
    subtitle: 'Doa untuk aktivitas sehari-hari',
    icon: 'sunny-outline',
    gradient: 'plum',
  },
  {
    href: '/doa-pilihan',
    title: 'Doa Pilihan',
    subtitle: 'Kumpulan doa pilihan berpahala',
    icon: 'star-outline',
    gradient: 'gold',
  },
] as const;

export default function DzikirHubScreen() {
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
        title="Dzikir"
        subtitle={isMorning ? 'Selamat pagi, awali hari dengan dzikir pagi' : 'Selamat petang, tutup hari dengan dzikir petang'}
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
                    <Text style={styles.modeTitle}>{mode.title}</Text>
                    {recommended ? <View style={styles.recommendChip}><Text style={styles.recommendText}>Waktunya</Text></View> : null}
                  </View>
                  <Text style={styles.modeSubtitle} numberOfLines={2}>
                    {mode.subtitle}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </LinearGradient>
            </PressableScale>
          </Animated.View>
        );
      })}

      <SectionHeader title="Bacaan Lainnya" />
      {OTHERS.map((item, index) => (
        <FeatureCard
          key={item.href}
          title={item.title}
          subtitle={item.subtitle}
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

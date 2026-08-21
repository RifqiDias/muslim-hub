import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FeatureCard, FeatureGradient } from '@/components/ui/feature-card';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { registerStrings, useLang } from '@/i18n';
import { font, radius, spacing, useTheme, type ThemeColors } from '@/theme';

registerStrings('more', {
  title: 'Lainnya',
  subtitle: 'Semua fitur Muslim Hub',
  language: 'Bahasa / Language',
  indonesia: 'Indonesia',
  english: 'English',
  sectionWorship: 'Ibadah',
  sectionDzikir: 'Dzikir & Doa',
  sectionLearn: 'Belajar',
  quranTitle: "Al Qur'an",
  quranSub: '114 surah dengan terjemahan',
  jadwalTitle: 'Jadwal Shalat',
  jadwalSub: 'Waktu shalat harian',
  niatTitle: 'Niat Shalat',
  niatSub: 'Niat seluruh shalat fardhu',
  bacaanTitle: 'Bacaan Shalat',
  bacaanSub: 'Bacaan lengkap dalam shalat',
  ayatKursiTitle: 'Ayat Kursi',
  ayatKursiSub: "Ayat paling agung dalam Al Qur'an",
  dzikirTitle: 'Dzikir Harian',
  dzikirSub: 'Pagi, petang & setelah shalat',
  wiridTitle: 'Wirid',
  wiridSub: 'Amalan wirid harian',
  tahlilTitle: 'Tahlil',
  tahlilSub: 'Bacaan tahlil lengkap',
  doaHarianTitle: 'Doa Harian',
  doaHarianSub: 'Doa aktivitas sehari-hari',
  doaPilihanTitle: 'Doa Pilihan',
  doaPilihanSub: 'Kumpulan doa pilihan',
  haditsTitle: 'Hadits',
  haditsSub: 'Kutipan hadits sahih',
  asmaulTitle: 'Asmaul Husna',
  asmaulSub: '99 nama Allah yang indah',
  kisahTitle: 'Kisah Nabi',
  kisahSub: 'Perjalanan 25 nabi & rasul',
  iqraTitle: 'Iqra',
  iqraSub: "Belajar membaca Al Qur'an",
}, {
  title: 'More',
  subtitle: 'All Muslim Hub features',
  language: 'Bahasa / Language',
  indonesia: 'Indonesia',
  english: 'English',
  sectionWorship: 'Worship',
  sectionDzikir: 'Dhikr & Dua',
  sectionLearn: 'Learn',
  quranTitle: "The Qur'an",
  quranSub: '114 surahs with translation',
  jadwalTitle: 'Prayer Times',
  jadwalSub: 'Daily prayer times',
  niatTitle: 'Prayer Intentions',
  niatSub: 'Intentions for all obligatory prayers',
  bacaanTitle: 'Prayer Recitations',
  bacaanSub: 'Complete recitations during prayer',
  ayatKursiTitle: 'Ayat al-Kursi',
  ayatKursiSub: 'The greatest verse in the Qur\u2019an',
  dzikirTitle: 'Daily Dhikr',
  dzikirSub: 'Morning, evening & after prayers',
  wiridTitle: 'Wirid',
  wiridSub: 'Daily wirid practice',
  tahlilTitle: 'Tahlil',
  tahlilSub: 'Complete tahlil recitation',
  doaHarianTitle: 'Daily Dua',
  doaHarianSub: 'Duas for daily activities',
  doaPilihanTitle: 'Selected Duas',
  doaPilihanSub: 'A collection of chosen duas',
  haditsTitle: 'Hadith',
  haditsSub: 'Authentic hadith quotes',
  asmaulTitle: 'Asmaul Husna',
  asmaulSub: 'The 99 beautiful names of Allah',
  kisahTitle: 'Prophet Stories',
  kisahSub: 'Journeys of 25 prophets & messengers',
  iqraTitle: 'Iqra',
  iqraSub: 'Learn to read the Qur\u2019an',
});

interface MenuEntry {
  titlePath: string;
  subtitlePath: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: FeatureGradient;
  href: Href;
}

interface MenuGroup {
  titlePath: string;
  items: MenuEntry[];
}

const GROUPS: MenuGroup[] = [
  {
    titlePath: 'more.sectionWorship',
    items: [
      { titlePath: 'more.quranTitle', subtitlePath: 'more.quranSub', icon: 'book', gradient: 'emerald', href: '/quran' },
      { titlePath: 'more.jadwalTitle', subtitlePath: 'more.jadwalSub', icon: 'time', gradient: 'teal', href: '/jadwal' },
      { titlePath: 'more.niatTitle', subtitlePath: 'more.niatSub', icon: 'hand-right', gradient: 'gold', href: '/niat-shalat' },
      { titlePath: 'more.bacaanTitle', subtitlePath: 'more.bacaanSub', icon: 'bookmarks', gradient: 'night', href: '/bacaan-shalat' },
      { titlePath: 'more.ayatKursiTitle', subtitlePath: 'more.ayatKursiSub', icon: 'star', gradient: 'plum', href: '/ayat-kursi' },
    ],
  },
  {
    titlePath: 'more.sectionDzikir',
    items: [
      { titlePath: 'more.dzikirTitle', subtitlePath: 'more.dzikirSub', icon: 'moon', gradient: 'night', href: '/dzikir' },
      { titlePath: 'more.wiridTitle', subtitlePath: 'more.wiridSub', icon: 'repeat', gradient: 'teal', href: '/wirid' },
      { titlePath: 'more.tahlilTitle', subtitlePath: 'more.tahlilSub', icon: 'heart', gradient: 'plum', href: '/tahlil' },
      { titlePath: 'more.doaHarianTitle', subtitlePath: 'more.doaHarianSub', icon: 'sunny', gradient: 'gold', href: '/doa-harian' },
      { titlePath: 'more.doaPilihanTitle', subtitlePath: 'more.doaPilihanSub', icon: 'flower', gradient: 'emerald', href: '/doa-pilihan' },
    ],
  },
  {
    titlePath: 'more.sectionLearn',
    items: [
      { titlePath: 'more.haditsTitle', subtitlePath: 'more.haditsSub', icon: 'newspaper', gradient: 'gold', href: '/hadith' },
      { titlePath: 'more.asmaulTitle', subtitlePath: 'more.asmaulSub', icon: 'sparkles', gradient: 'plum', href: '/asmaul-husna' },
      { titlePath: 'more.kisahTitle', subtitlePath: 'more.kisahSub', icon: 'people', gradient: 'teal', href: '/kisah-nabi' },
      { titlePath: 'more.iqraTitle', subtitlePath: 'more.iqraSub', icon: 'school', gradient: 'night', href: '/iqra' },
    ],
  },
];

const LANG_OPTIONS = ['id', 'en'] as const;

export default function LainnyaScreen() {
  const { t, lang, setLang } = useLang();
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Screen scroll>
      <PageHeader back={false} title={t('more.title')} subtitle={t('more.subtitle')} />
      <Animated.View entering={FadeInDown.duration(450).delay(60)} style={styles.langCard}>
        <View style={styles.langIcon}>
          <Ionicons name="language" size={22} color={colors.primary} />
        </View>
        <View style={styles.langTitles}>
          <Text style={styles.langTitle}>{t('more.language')}</Text>
        </View>
        <View style={styles.langToggle}>
          {LANG_OPTIONS.map((option) => (
            <PressableScale
              key={option}
              onPress={() => setLang(option)}
              style={[styles.segment, lang === option && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, lang === option && styles.segmentTextActive]}>
                {option === 'id' ? t('more.indonesia') : t('more.english')}
              </Text>
            </PressableScale>
          ))}
        </View>
      </Animated.View>
      {GROUPS.map((group) => (
        <View key={group.titlePath}>
          <SectionHeader title={t(group.titlePath)} />
          <View style={styles.groupList}>
            {group.items.map((item, index) => (
              <FeatureCard
                key={item.titlePath}
                title={t(item.titlePath)}
                subtitle={t(item.subtitlePath)}
                icon={item.icon}
                gradient={item.gradient}
                delay={index * 70}
                onPress={() => router.push(item.href)}
              />
            ))}
          </View>
        </View>
      ))}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Muslim Hub v1.0 • Data: api.qalbun.my.id</Text>
      </View>
    </Screen>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    langCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.base,
      borderRadius: radius.lg,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: spacing.xl,
    },
    langIcon: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    langTitles: {
      flex: 1,
    },
    langTitle: {
      fontFamily: font.semibold,
      fontSize: 15,
      color: c.text,
    },
    langToggle: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    segment: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: radius.full,
    },
    segmentActive: {
      backgroundColor: c.primarySoft,
    },
    segmentText: {
      fontFamily: font.semibold,
      fontSize: 12.5,
      color: c.textMuted,
    },
    segmentTextActive: {
      color: c.primary,
    },
    groupList: {
      gap: spacing.md,
    },
    footer: {
      alignItems: 'center',
      marginTop: spacing.xxl,
    },
    footerText: {
      fontFamily: font.regular,
      fontSize: 11.5,
      color: c.textFaint,
    },
  });

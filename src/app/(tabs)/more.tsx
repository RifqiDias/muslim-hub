import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { Href } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FeatureCard, FeatureGradient } from '@/components/ui/feature-card';
import { PageHeader } from '@/components/ui/page-header';
import { Screen } from '@/components/ui/screen';
import { SectionHeader } from '@/components/ui/section-header';
import { font, spacing, useTheme, type ThemeColors } from '@/theme';

interface MenuEntry {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient: FeatureGradient;
  href: Href;
}

interface MenuGroup {
  title: string;
  items: MenuEntry[];
}

const GROUPS: MenuGroup[] = [
  {
    title: 'Ibadah',
    items: [
      { title: "Al Qur'an", subtitle: '114 surah dengan terjemahan', icon: 'book', gradient: 'emerald', href: '/quran' },
      { title: 'Jadwal Shalat', subtitle: 'Waktu shalat harian', icon: 'time', gradient: 'teal', href: '/jadwal' },
      { title: 'Niat Shalat', subtitle: 'Niat seluruh shalat fardhu', icon: 'hand-right', gradient: 'gold', href: '/niat-shalat' },
      { title: 'Bacaan Shalat', subtitle: 'Bacaan lengkap dalam shalat', icon: 'bookmarks', gradient: 'night', href: '/bacaan-shalat' },
      { title: 'Ayat Kursi', subtitle: 'Ayat paling agung dalam Al Qur\'an', icon: 'star', gradient: 'plum', href: '/ayat-kursi' },
    ],
  },
  {
    title: 'Dzikir & Doa',
    items: [
      { title: 'Dzikir Harian', subtitle: 'Pagi, petang & setelah shalat', icon: 'moon', gradient: 'night', href: '/dzikir' },
      { title: 'Wirid', subtitle: 'Amalan wirid harian', icon: 'repeat', gradient: 'teal', href: '/wirid' },
      { title: 'Tahlil', subtitle: 'Bacaan tahlil lengkap', icon: 'heart', gradient: 'plum', href: '/tahlil' },
      { title: 'Doa Harian', subtitle: 'Doa aktivitas sehari-hari', icon: 'sunny', gradient: 'gold', href: '/doa-harian' },
      { title: 'Doa Pilihan', subtitle: 'Kumpulan doa pilihan', icon: 'flower', gradient: 'emerald', href: '/doa-pilihan' },
    ],
  },
  {
    title: 'Belajar',
    items: [
      { title: 'Hadits', subtitle: 'Kutipan hadits sahih', icon: 'newspaper', gradient: 'gold', href: '/hadith' },
      { title: 'Asmaul Husna', subtitle: '99 nama Allah yang indah', icon: 'sparkles', gradient: 'plum', href: '/asmaul-husna' },
      { title: 'Kisah Nabi', subtitle: 'Perjalanan 25 nabi & rasul', icon: 'people', gradient: 'teal', href: '/kisah-nabi' },
      { title: 'Iqra', subtitle: 'Belajar membaca Al Qur\'an', icon: 'school', gradient: 'night', href: '/iqra' },
      { title: 'Qalbun AI', subtitle: 'Tanya seputar Islam', icon: 'chatbubbles', gradient: 'emerald', href: '/ai' },
    ],
  },
  {
    title: 'Media',
    items: [
      { title: 'Wallpaper Islami', subtitle: 'Hiasan layar penuh berkah', icon: 'images', gradient: 'gold', href: '/wallpaper' },
    ],
  },
];

export default function LainnyaScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Screen scroll>
      <PageHeader back={false} title="Lainnya" subtitle="Semua fitur Muslim Hub" />
      {GROUPS.map((group) => (
        <View key={group.title}>
          <SectionHeader title={group.title} />
          <View style={styles.groupList}>
            {group.items.map((item, index) => (
              <FeatureCard
                key={item.title}
                title={item.title}
                subtitle={item.subtitle}
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

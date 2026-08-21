import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { useMemo, useState } from 'react';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { ArabicText } from '@/components/ui/arabic-text';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { registerStrings, useLang } from '@/i18n';
import { font, radius, shadow, spacing, ThemeColors, useTheme } from '@/theme';

registerStrings('about', {
  title: 'Tentang',
  subtitle: 'Info aplikasi Muslim Hub',
  version: 'Versi',
  versionCode: '1.0.0',
  descriptionTitle: 'Tentang Muslim Hub',
  descriptionBody:
    'Muslim Hub adalah aplikasi islami lengkap: Al Qur\u2019an dengan terjemahan, tafsir, transliterasi, mode mushaf, dan murottal; jadwal shalat akurat seluruh Indonesia; dzikir, wirid, doa, hadits, Asmaul Husna, kisah nabi, dan belajar Iqra \u2014 dalam satu aplikasi yang ringan dan indah.',
  duacard: 'Semoga bermanfaat untuk kita semua.',
  contactTitle: 'Butuh Bantuan?',
  contactBody: 'Menemukan error, punya info perbaikan, atau masukan untuk fitur baru? Hubungi kami:',
  emailLabel: 'Email',
  emailAction: 'Kirim Email',
  emailSubject: '[Muslim Hub] Masukan & Laporan',
  emailBody: 'Halo tim Muslim Hub,\n\n\n\n---\nDikirim dari aplikasi Muslim Hub v1.0.0',
  sourceTitle: 'Sumber Data',
  sourceBody: 'Jadwal shalat & data kota: api.myquran.com \u00b7 Al Qur\u2019an & tafsir: QuranJSON & alquran.cloud \u00b7 Konten islami: api.qalbun.my.id',
  madeWith: 'Dibuat dengan penuh cinta untuk umat',
}, {
  title: 'About',
  subtitle: 'Muslim Hub app info',
  version: 'Version',
  versionCode: '1.0.0',
  descriptionTitle: 'About Muslim Hub',
  descriptionBody:
    'Muslim Hub is a complete Islamic app: the Qur\u2019an with translation, tafsir, transliteration, mushaf mode, and murottal audio; accurate prayer times across Indonesia; dhikr, wirid, duas, hadith, Asmaul Husna, prophet stories, and Iqra learning \u2014 all in one beautiful, lightweight app.',
  duacard: 'May it benefit us all.',
  contactTitle: 'Need Help?',
  contactBody: 'Found a bug, have a fix to share, or suggestions for new features? Contact us:',
  emailLabel: 'Email',
  emailAction: 'Send Email',
  emailSubject: '[Muslim Hub] Feedback & Report',
  emailBody: 'Hello Muslim Hub team,\n\n\n\n---\nSent from Muslim Hub app v1.0.0',
  sourceTitle: 'Data Sources',
  sourceBody: 'Prayer times & cities: api.myquran.com \u00b7 Qur\u2019an & tafsir: QuranJSON & alquran.cloud \u00b7 Islamic content: api.qalbun.my.id',
  madeWith: 'Made with love for the ummah',
});

const CONTACT_EMAIL = 'rifqidias6@gmail.com';

export default function AboutScreen() {
  const { t } = useLang();
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [copied, setCopied] = useState(false);

  const openEmail = () => {
    const subject = encodeURIComponent(t('about.emailSubject'));
    const body = encodeURIComponent(t('about.emailBody'));
    Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`).catch(() => undefined);
  };

  const copyEmail = async () => {
    const Clipboard = await import('expo-clipboard');
    await Clipboard.setStringAsync(CONTACT_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <Screen scroll>
      <PageHeader title={t('about.title')} subtitle={t('about.subtitle')} />

      <Animated.View entering={FadeInDown.duration(450).delay(60)}>
        <LinearGradient
          colors={[...gradients.emerald]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Animated.View entering={ZoomIn.springify().delay(140)} style={styles.logoWrap}>
            <Ionicons name="moon" size={34} color={colors.gold} />
          </Animated.View>
          <Text style={styles.appName}>Muslim Hub</Text>
          <ArabicText size={20} center color={colors.gold}>
            مُسْلِم هَب
          </ArabicText>
          <View style={styles.versionChip}>
            <Text style={styles.versionText}>
              {t('about.version')} {t('about.versionCode')}
            </Text>
          </View>
          <Text style={styles.madeWith}>{t('about.madeWith')}</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(450).delay(140)} style={styles.card}>
        <Text style={styles.cardTitle}>{t('about.descriptionTitle')}</Text>
        <Text style={styles.cardBody}>{t('about.descriptionBody')}</Text>
        <Text style={styles.dua}>{t('about.duacard')}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(450).delay(220)} style={[styles.card, styles.contactCard]}>
        <View style={styles.contactIcon}>
          <Ionicons name="mail" size={22} color={colors.primary} />
        </View>
        <Text style={styles.cardTitle}>{t('about.contactTitle')}</Text>
        <Text style={styles.cardBody}>{t('about.contactBody')}</Text>
        <View style={styles.emailRow}>
          <View style={styles.emailChip}>
            <Ionicons name="mail-outline" size={14} color={colors.primary} />
            <Text style={styles.emailText}>{CONTACT_EMAIL}</Text>
          </View>
        </View>
        <View style={styles.contactActions}>
          <PressableScale onPress={openEmail} style={styles.primaryBtn}>
            <Ionicons name="send" size={16} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>{t('about.emailAction')}</Text>
          </PressableScale>
          <PressableScale onPress={copyEmail} style={styles.secondaryBtn}>
            <Ionicons
              name={copied ? 'checkmark' : 'copy-outline'}
              size={16}
              color={copied ? colors.primary : colors.text}
            />
            <Text style={styles.secondaryBtnText}>{copied ? '✓' : t('about.emailLabel')}</Text>
          </PressableScale>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(450).delay(300)} style={styles.card}>
        <View style={styles.sourceHeader}>
          <Ionicons name="server-outline" size={16} color={colors.gold} />
          <Text style={styles.cardTitleSmall}>{t('about.sourceTitle')}</Text>
        </View>
        <Text style={styles.cardBody}>{t('about.sourceBody')}</Text>
      </Animated.View>

      <Text style={styles.footer}>Muslim Hub v1.0.0</Text>
    </Screen>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    hero: {
      alignItems: 'center',
      borderRadius: radius.xl,
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      ...shadow.card,
    },
    logoWrap: {
      width: 76,
      height: 76,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    appName: {
      fontFamily: font.extrabold,
      fontSize: 24,
      color: c.text,
      marginTop: spacing.md,
    },
    versionChip: {
      backgroundColor: 'rgba(255,255,255,0.18)',
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 4,
      marginTop: spacing.md,
    },
    versionText: {
      fontFamily: font.semibold,
      fontSize: 11.5,
      color: c.text,
    },
    madeWith: {
      fontFamily: font.regular,
      fontSize: 11.5,
      color: c.text,
      opacity: 0.7,
      marginTop: spacing.sm,
    },
    card: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.xl,
      padding: spacing.lg,
      marginTop: spacing.md,
      gap: spacing.sm,
    },
    contactCard: {
      borderWidth: 1.5,
      borderColor: c.primary,
    },
    contactIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardTitle: {
      fontFamily: font.bold,
      fontSize: 16,
      color: c.text,
    },
    cardTitleSmall: {
      fontFamily: font.bold,
      fontSize: 14,
      color: c.text,
    },
    cardBody: {
      fontFamily: font.regular,
      fontSize: 13,
      lineHeight: 20,
      color: c.textMuted,
    },
    dua: {
      fontFamily: font.semibold,
      fontSize: 12.5,
      color: c.gold,
      fontStyle: 'italic',
    },
    emailRow: {
      flexDirection: 'row',
    },
    emailChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: c.surfaceAlt,
      borderRadius: radius.full,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
    },
    emailText: {
      fontFamily: font.semibold,
      fontSize: 12.5,
      color: c.primary,
    },
    contactActions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.xs,
    },
    primaryBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: c.primary,
      borderRadius: radius.full,
      paddingVertical: spacing.md,
    },
    primaryBtnText: {
      fontFamily: font.bold,
      fontSize: 13.5,
      color: '#FFFFFF',
    },
    secondaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: c.surfaceAlt,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.full,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    secondaryBtnText: {
      fontFamily: font.semibold,
      fontSize: 13,
      color: c.text,
    },
    sourceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    footer: {
      fontFamily: font.regular,
      fontSize: 11,
      color: c.textFaint,
      textAlign: 'center',
      marginTop: spacing.xl,
    },
  });

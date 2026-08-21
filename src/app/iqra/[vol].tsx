import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { getIqraPdfUrl } from '@/lib/api';
import { colors, font, gradients, radius, shadow, spacing } from '@/theme';

export default function IqraVolScreen() {
  const params = useLocalSearchParams<{ vol: string }>();
  const vol = params.vol || '1';
  const cacheDir = FileSystem.cacheDirectory;
  const fileUri = `${cacheDir ?? ''}iqra-${vol}.pdf`;

  const [exists, setExists] = useState(false);
  const [fileSize, setFileSize] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [opening, setOpening] = useState(false);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const barWidth = useSharedValue(0);

  useEffect(() => {
    barWidth.value = withTiming(pct, { duration: 200 });
  }, [pct, barWidth]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
  }));

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!cacheDir) return;
      try {
        const info = await FileSystem.getInfoAsync(fileUri);
        if (!mounted) return;
        setExists(info.exists);
        setFileSize(info.exists ? (info.size ?? 0) : 0);
      } catch {
        if (mounted) setExists(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [cacheDir, fileUri]);

  const sizeLabel = fileSize > 0 ? ` • ${(fileSize / 1024 / 1024).toFixed(1)} MB` : '';

  const openPdf = async () => {
    if (opening) return;
    setOpening(true);
    setError(null);
    try {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: `Iqra Jilid ${vol}`,
      });
    } catch {
      setError('Tidak dapat membuka PDF di perangkat Anda.');
    } finally {
      setOpening(false);
    }
  };

  const downloadPdf = async (isRedownload = false) => {
    if (downloading || opening) return;
    if (!cacheDir) {
      setError('Penyimpanan tidak tersedia di perangkat ini.');
      return;
    }
    setDownloading(true);
    setError(null);
    setPct(0);
    try {
      const task = FileSystem.createDownloadResumable(getIqraPdfUrl(vol), fileUri, {}, (data) => {
        const expected = data.totalBytesExpectedToWrite;
        setPct(expected > 0 ? Math.floor((data.totalBytesWritten / expected) * 100) : 0);
      });
      const result = await task.downloadAsync();
      if (!result || result.status >= 400) throw new Error('download');
      setExists(true);
      const info = await FileSystem.getInfoAsync(fileUri);
      setFileSize(info.exists ? (info.size ?? 0) : 0);
      if (!isRedownload) await openPdf();
    } catch {
      setError('Gagal mengunduh PDF. Periksa koneksi internet Anda.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Screen scroll>
      <PageHeader title={`Iqra Jilid ${vol}`} subtitle="Belajar membaca Al Qur'an" />
      <Animated.View entering={FadeInDown.duration(450).delay(60)} style={[styles.hero, shadow.card]}>
        <LinearGradient
          colors={[...gradients.emerald]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGrad}
        >
          <View style={styles.heroIcon}>
            <Ionicons name="document-text" size={64} color={colors.gold} />
          </View>
          <Text style={styles.heroTitle}>Jilid {vol}</Text>
          <Text style={styles.heroSub}>Metode Iqra untuk belajar membaca Al Qur&apos;an</Text>
          <Text style={styles.heroStatus}>
            {exists ? `PDF siap dibuka${sizeLabel}` : 'PDF belum tersimpan di perangkat'}
          </Text>
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(450).delay(140)} style={styles.panel}>
        {downloading ? (
          <View style={styles.progressBox}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Mengunduh PDF…</Text>
              <Text style={styles.progressPct}>{pct}%</Text>
            </View>
            <View style={styles.track}>
              <Animated.View style={[styles.fill, barStyle]} />
            </View>
          </View>
        ) : null}

        {error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              setError(null);
              void downloadPdf();
            }}
          />
        ) : null}

        {exists ? (
          <View style={styles.buttonStack}>
            <PressableScale onPress={() => void openPdf()} style={styles.primaryOuter} disabled={opening || downloading}>
              <LinearGradient
                colors={[...gradients.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtn}
              >
                <Ionicons name="document-text" size={20} color={colors.bgDeep} />
                <Text style={styles.primaryText}>{opening ? 'Membuka…' : 'Buka PDF'}</Text>
              </LinearGradient>
            </PressableScale>
            <PressableScale onPress={() => void downloadPdf(true)} style={styles.ghostBtn} disabled={downloading}>
              <Ionicons name="refresh" size={17} color={colors.textMuted} />
              <Text style={styles.ghostText}>Unduh Ulang</Text>
            </PressableScale>
          </View>
        ) : (
          <PressableScale onPress={() => void downloadPdf()} style={styles.primaryOuter} disabled={downloading}>
            <LinearGradient
              colors={[...gradients.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryBtn}
            >
              <Ionicons name="download" size={20} color={colors.bgDeep} />
              <Text style={styles.primaryText}>Unduh &amp; Buka PDF</Text>
            </LinearGradient>
          </PressableScale>
        )}

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={15} color={colors.textFaint} />
          <Text style={styles.noteText}>File dibuka dengan aplikasi pembaca PDF di HP Anda</Text>
        </View>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  heroGrad: {
    alignItems: 'center',
    padding: spacing.xxl,
    gap: spacing.xs,
  },
  heroIcon: {
    width: 116,
    height: 116,
    borderRadius: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontFamily: font.extrabold,
    fontSize: 28,
    lineHeight: 34,
    color: colors.white,
  },
  heroSub: {
    fontFamily: font.regular,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  heroStatus: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.gold,
    marginTop: spacing.sm,
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
    marginTop: spacing.md,
  },
  progressBox: {
    gap: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.text,
  },
  progressPct: {
    fontFamily: font.bold,
    fontSize: 13,
    color: colors.primary,
  },
  track: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  buttonStack: {
    gap: spacing.md,
  },
  primaryOuter: {
    borderRadius: radius.full,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.full,
    paddingVertical: spacing.md + 2,
  },
  primaryText: {
    fontFamily: font.bold,
    fontSize: 15,
    color: colors.bgDeep,
  },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
  },
  ghostText: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.textMuted,
  },
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  noteText: {
    fontFamily: font.regular,
    fontSize: 11,
    color: colors.textFaint,
    textAlign: 'center',
  },
});

import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { SkeletonBlock } from '@/components/ui/skeleton';
import { Screen } from '@/components/ui/screen';
import { getRandomWallpaper } from '@/lib/api';
import { colors, font, gradients, radius, shadow, spacing } from '@/theme';
import * as FileSystem from 'expo-file-system/legacy';

export default function WallpaperScreen() {
  const { height } = useWindowDimensions();
  const [seed, setSeed] = useState<number>(() => Date.now());
  const [loaded, setLoaded] = useState(false);
  const [savePct, setSavePct] = useState<number | null>(null);
  const [sharing, setSharing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const query = useQuery({
    queryKey: ['wallpaper', seed],
    queryFn: () => getRandomWallpaper(),
    staleTime: 0,
    gcTime: 0,
  });

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const changeWallpaper = () => setSeed(Date.now());

  const saveWallpaper = async () => {
    const url = query.data;
    if (!url || savePct !== null) return;
    setSavePct(0);
    try {
      const permission = await MediaLibrary.requestPermissionsAsync(true);
      if (!permission.granted) {
        showToast('Izin akses galeri ditolak');
        return;
      }
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) throw new Error('storage');
      const fileUri = `${cacheDir}wall-${Date.now()}.jpg`;
      const task = FileSystem.createDownloadResumable(url, fileUri, {}, (data) => {
        const expected = data.totalBytesExpectedToWrite;
        setSavePct(expected > 0 ? Math.floor((data.totalBytesWritten / expected) * 100) : 0);
      });
      const result = await task.downloadAsync();
      if (!result) throw new Error('download');
      await MediaLibrary.Asset.create(result.uri);
      showToast('Wallpaper tersimpan di galeri');
    } catch {
      showToast('Gagal menyimpan wallpaper');
    } finally {
      setSavePct(null);
    }
  };

  const shareWallpaper = async () => {
    const url = query.data;
    if (!url || sharing) return;
    setSharing(true);
    try {
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) throw new Error('storage');
      const fileUri = `${cacheDir}wall-share-${Date.now()}.jpg`;
      const result = await FileSystem.downloadAsync(url, fileUri);
      await Sharing.shareAsync(result.uri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Bagikan Wallpaper Islami',
      });
    } catch {
      showToast('Gagal membagikan wallpaper');
    } finally {
      setSharing(false);
    }
  };

  const cardHeight = Math.round(height * 0.62);

  return (
    <Screen contentStyle={styles.content}>
      <PageHeader title="Wallpaper Islami" subtitle="Wallpaper acak untuk perangkat Anda" />
      <View style={[styles.card, { height: cardHeight }, shadow.card]}>
        {query.isPending ? (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <SkeletonBlock width="100%" height={cardHeight} radius={0} />
          </View>
        ) : query.isError ? (
          <View style={styles.errorWrap}>
            <ErrorState
              message="Wallpaper gagal dimuat. Periksa koneksi internet Anda."
              onRetry={changeWallpaper}
            />
          </View>
        ) : (
          <Animated.View key={query.data} entering={ZoomIn.springify().duration(500)} style={StyleSheet.absoluteFill}>
            {!loaded ? (
              <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <SkeletonBlock width="100%" height={cardHeight} radius={0} />
              </View>
            ) : null}
            <Image
              source={{ uri: query.data }}
              recyclingKey={query.data}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              transition={600}
              onLoadStart={() => setLoaded(false)}
              onLoad={() => setLoaded(true)}
            />
            <LinearGradient
              colors={['rgba(6,16,9,0)', 'rgba(6,16,9,0.55)']}
              style={styles.shade}
              pointerEvents="none"
            />
          </Animated.View>
        )}
      </View>
      <View style={styles.actions}>
        {toast ? (
          <Animated.View key={toast} entering={FadeIn.duration(250)} exiting={FadeOut.duration(250)} style={styles.toast}>
            <Ionicons name="checkmark-circle" size={15} color={colors.primary} />
            <Text style={styles.toastText}>{toast}</Text>
          </Animated.View>
        ) : null}
        <PressableScale onPress={changeWallpaper} style={styles.primaryOuter}>
          <LinearGradient
            colors={[...gradients.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryBtn}
          >
            <Ionicons name="refresh" size={19} color={colors.bgDeep} />
            <Text style={styles.primaryText}>Wallpaper Lain</Text>
          </LinearGradient>
        </PressableScale>
        <View style={styles.row}>
          <PressableScale onPress={saveWallpaper} style={styles.secondaryBtn} disabled={savePct !== null}>
            <Ionicons name="download" size={18} color={savePct !== null ? colors.textFaint : colors.primary} />
            <Text style={styles.secondaryText} numberOfLines={1}>
              {savePct === null ? 'Simpan' : `Menyimpan ${savePct}%`}
            </Text>
          </PressableScale>
          <PressableScale onPress={shareWallpaper} style={styles.secondaryBtn} disabled={sharing}>
            <Ionicons name="share-social" size={18} color={sharing ? colors.textFaint : colors.gold} />
            <Text style={styles.secondaryText} numberOfLines={1}>
              {sharing ? 'Membuka…' : 'Bagikan'}
            </Text>
          </PressableScale>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.base,
  },
  card: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  errorWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  shade: {
    position: 'absolute',
    top: '55%',
    left: 0,
    right: 0,
    bottom: 0,
  },
  actions: {
    flex: 1,
    justifyContent: 'flex-end',
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  toastText: {
    fontFamily: font.regular,
    fontSize: 12,
    color: colors.textMuted,
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  secondaryText: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.text,
  },
});

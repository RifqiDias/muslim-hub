import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { File, Paths } from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArabicText } from '@/components/ui/arabic-text';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SearchBar } from '@/components/ui/search-bar';
import { SkeletonList } from '@/components/ui/skeleton';
import { getAsmaulHusna } from '@/lib/api';
import { getJSON, setJSON, StorageKeys } from '@/lib/storage';
import { AsmaulHusnaItem } from '@/lib/types';
import { font, radius, shadow, spacing, ThemeColors, ThemeGradients, useTheme } from '@/theme';

const makeCardGradients = (g: ThemeGradients): readonly (readonly [string, string])[] => [
  g.emerald,
  g.teal,
  g.gold,
  g.night,
  g.plum,
];

export default function AsmaulHusnaScreen() {
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selected, setSelected] = useState<AsmaulHusnaItem | null>(null);
  const insets = useSafeAreaInsets();
  const { colors, gradients, scheme, typography } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const cardGradients = makeCardGradients(gradients);

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['asmaul-husna'],
    queryFn: getAsmaulHusna,
  });

  useEffect(() => {
    let mounted = true;
    getJSON<string[]>(StorageKeys.favoriteAsmaul).then((value) => {
      if (mounted && value) setFavorites(value);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const toggleFavorite = useCallback((index: string) => {
    setFavorites((prev) => {
      const next = prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index];
      setJSON(StorageKeys.favoriteAsmaul, next).catch(() => undefined);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (item) =>
        item.latin.toLowerCase().includes(q) ||
        item.translation_id.toLowerCase().includes(q) ||
        item.index.includes(q),
    );
  }, [data, query]);

  const isFavorite = selected !== null && favorites.includes(selected.index);

  const handleShare = useCallback(async () => {
    if (!selected) return;
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) return;
      const file = new File(Paths.cache, 'muslimhub-asmaul-husna.txt');
      file.write(
        `${selected.arabic}\n\n${selected.latin} — ${selected.translation_id}\n\n"${selected.translation_en}"\n\nDari aplikasi Muslim Hub`,
      );
      await Sharing.shareAsync(file.uri, {
        mimeType: 'text/plain',
        dialogTitle: 'Bagikan Asmaul Husna',
      });
    } catch {
      return;
    }
  }, [selected]);

  const renderItem = ({ item, index }: { item: AsmaulHusnaItem; index: number }) => {
    const gradient = cardGradients[index % cardGradients.length];
    const favorited = favorites.includes(item.index);
    return (
      <Animated.View
        entering={FadeInDown.duration(400).delay(Math.min(index, 10) * 50)}
        style={styles.cardWrap}
        collapsable={false}
      >
        <PressableScale onPress={() => setSelected(item)} style={styles.card}>
          <LinearGradient
            colors={[...gradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            <View style={styles.cardTop}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.index}</Text>
              </View>
              {favorited ? <Ionicons name="star" size={15} color={colors.gold} /> : null}
            </View>
            <ArabicText size={30} center color={colors.gold} style={styles.cardArabic}>
              {item.arabic}
            </ArabicText>
            <Text style={styles.cardLatin} numberOfLines={1}>
              {item.latin}
            </Text>
            <Text style={styles.cardTranslation} numberOfLines={2}>
              {item.translation_id}
            </Text>
          </LinearGradient>
        </PressableScale>
      </Animated.View>
    );
  };

  return (
    <Screen contentStyle={styles.screenContent}>
      <PageHeader title="Asmaul Husna" subtitle="99 Nama Allah yang Indah" />
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Cari nama, arti, atau nomor..."
        delay={60}
      />
      <View style={styles.listArea}>
        {isPending ? (
          <SkeletonList count={6} height={168} />
        ) : isError ? (
          <ErrorState message="Gagal memuat Asmaul Husna." onRetry={() => refetch()} />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={44} color={colors.textMuted} />
            <Text style={typography.h2}>Tidak ditemukan</Text>
            <Text style={[typography.caption, styles.emptyMessage]}>
              Tidak ada nama yang cocok dengan &quot;{query.trim()}&quot;.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.index}
            numColumns={2}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            initialNumToRender={12}
          />
        )}
      </View>

      <Modal
        visible={selected !== null}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalRoot}>
          <Animated.View
            entering={FadeIn.duration(250)}
            exiting={FadeOut.duration(250)}
            style={StyleSheet.absoluteFill}
            collapsable={false}
          >
            <View
              style={[
                styles.backdrop,
                {
                  backgroundColor:
                    scheme === 'dark' ? 'rgba(4, 12, 9, 0.78)' : 'rgba(24, 39, 32, 0.45)',
                },
              ]}
            />
          </Animated.View>
          <Pressable onPress={() => setSelected(null)} style={StyleSheet.absoluteFill} />
          {selected ? (
            <Animated.View
              entering={SlideInDown.springify().damping(18).stiffness(220)}
              style={styles.sheet}
              collapsable={false}
            >
              <View style={styles.handle} />
              <View style={styles.sheetTop}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{selected.index}</Text>
                </View>
                <PressableScale onPress={() => setSelected(null)} style={styles.closeButton} hitSlop={8}>
                  <Ionicons name="close" size={20} color={colors.text} />
                </PressableScale>
              </View>
              <ArabicText size={56} center bold color={colors.gold} style={styles.sheetArabic}>
                {selected.arabic}
              </ArabicText>
              <Text style={[typography.h1, styles.sheetLatin]}>{selected.latin}</Text>
              <Text style={[typography.body, styles.sheetTranslationId]}>
                {selected.translation_id}
              </Text>
              <Text style={[typography.caption, styles.sheetTranslationEn]}>
                {selected.translation_en}
              </Text>
              <View style={styles.sheetActions}>
                <PressableScale onPress={handleShare} style={styles.actionButton}>
                  <Ionicons name="share-social-outline" size={18} color={colors.primary} />
                  <Text style={styles.actionText}>Bagikan</Text>
                </PressableScale>
                <PressableScale
                  onPress={() => toggleFavorite(selected.index)}
                  style={[styles.actionButton, isFavorite && styles.actionButtonActive]}
                >
                  <Ionicons
                    name={isFavorite ? 'star' : 'star-outline'}
                    size={18}
                    color={isFavorite ? colors.bg : colors.gold}
                  />
                  <Text style={[styles.actionText, isFavorite && styles.actionTextActive]}>
                    {isFavorite ? 'Disimpan' : 'Favorit'}
                  </Text>
                </PressableScale>
              </View>
              <View style={{ height: insets.bottom + spacing.base }} />
            </Animated.View>
          ) : null}
        </View>
      </Modal>
    </Screen>
  );
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    screenContent: {
      paddingBottom: 0,
    },
    listArea: {
      flex: 1,
      marginTop: spacing.md,
    },
    listContent: {
      gap: spacing.md,
      paddingBottom: spacing.xxxl,
    },
    cardWrap: {
      flex: 1,
    },
    card: {
      borderRadius: radius.lg,
      overflow: 'hidden',
      ...shadow.card,
    },
    cardGradient: {
      minHeight: 172,
      padding: spacing.base,
      borderRadius: radius.lg,
      justifyContent: 'space-between',
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    badge: {
      minWidth: 28,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.full,
      backgroundColor: c.primarySoft,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
    },
    badgeText: {
      fontFamily: font.bold,
      fontSize: 11,
      color: c.primary,
    },
    cardArabic: {
      marginBottom: spacing.sm,
    },
    cardLatin: {
      fontFamily: font.semibold,
      fontSize: 14,
      color: c.text,
      textAlign: 'center',
    },
    cardTranslation: {
      fontFamily: font.regular,
      fontSize: 12,
      lineHeight: 16,
      color: c.textMuted,
      textAlign: 'center',
      marginTop: 2,
    },
    empty: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.xxxl,
    },
    emptyMessage: {
      textAlign: 'center',
      maxWidth: 260,
    },
    modalRoot: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      flex: 1,
    },
    sheet: {
      backgroundColor: c.surface,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      borderWidth: 1,
      borderColor: c.borderStrong,
    },
    handle: {
      alignSelf: 'center',
      width: 44,
      height: 5,
      borderRadius: radius.full,
      backgroundColor: c.borderStrong,
      marginBottom: spacing.md,
    },
    sheetTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surfaceAlt,
      borderWidth: 1,
      borderColor: c.border,
    },
    sheetArabic: {
      marginBottom: spacing.md,
    },
    sheetLatin: {
      textAlign: 'center',
    },
    sheetTranslationId: {
      color: c.primary,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    sheetTranslationEn: {
      textAlign: 'center',
      marginTop: spacing.xs,
      fontStyle: 'italic',
    },
    sheetActions: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.xxl,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.base,
      borderRadius: radius.full,
      backgroundColor: c.surfaceAlt,
      borderWidth: 1,
      borderColor: c.border,
    },
    actionButtonActive: {
      backgroundColor: c.gold,
      borderColor: c.gold,
    },
    actionText: {
      fontFamily: font.semibold,
      fontSize: 14,
      color: c.text,
    },
    actionTextActive: {
      color: c.bg,
    },
  });

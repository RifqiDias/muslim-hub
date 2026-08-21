import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import { useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Keyboard, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ArabicText } from '@/components/ui/arabic-text';
import { ErrorState } from '@/components/ui/error-state';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import { SkeletonList } from '@/components/ui/skeleton';
import { getHadithBooks, getHadithByNumber, getHadithByRange } from '@/lib/api';
import { HadithContent } from '@/lib/types';
import { colors, font, radius, spacing } from '@/theme';

const PAGE_SIZE = 50;

interface HadithCardProps {
  hadith: HadithContent;
  expanded: boolean;
  onToggle: () => void;
  sourceLabel: string;
  delay?: number;
}

function HadithCard({ hadith, expanded, onToggle, sourceLabel, delay = 0 }: HadithCardProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `${hadith.arab}\n\n${hadith.id}\n\n(${sourceLabel} No. ${hadith.number})`;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(shareText).catch(() => undefined);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleShare = async () => {
    let shared = false;
    try {
      if (await Sharing.isAvailableAsync()) {
        const fileUri = `${FileSystem.cacheDirectory ?? ''}hadith-${Date.now()}.txt`;
        await FileSystem.writeAsStringAsync(fileUri, shareText, { encoding: FileSystem.EncodingType.UTF8 });
        await Sharing.shareAsync(fileUri, { mimeType: 'text/plain', dialogTitle: 'Bagikan Hadits' });
        shared = true;
      }
    } catch {
      shared = false;
    }
    if (!shared) {
      Share.share({ message: shareText }).catch(() => undefined);
    }
  };

  return (
    <Animated.View entering={FadeInDown.springify().delay(delay)} style={styles.card}>
      <PressableScale onPress={onToggle} style={styles.cardHeader} haptic={false} scaleTo={0.99}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>No. {hadith.number}</Text>
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {hadith.id}
        </Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </PressableScale>
      {expanded ? (
        <Animated.View entering={FadeIn.duration(250)} style={styles.cardBody}>
          <ArabicText size={24}>{hadith.arab}</ArabicText>
          <View style={styles.divider} />
          <Text style={styles.translation}>{hadith.id}</Text>
          <View style={styles.actions}>
            <PressableScale onPress={handleCopy} style={styles.actionBtn}>
              <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={16} color={copied ? colors.primary : colors.textMuted} />
              <Text style={[styles.actionText, copied && styles.actionTextActive]}>{copied ? 'Tersalin' : 'Salin'}</Text>
            </PressableScale>
            <PressableScale onPress={handleShare} style={styles.actionBtn}>
              <Ionicons name="share-social-outline" size={16} color={colors.textMuted} />
              <Text style={styles.actionText}>Bagikan</Text>
            </PressableScale>
          </View>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

export default function HadithKitabScreen() {
  const params = useLocalSearchParams<{ kitab?: string; name?: string }>();
  const kitab = params.kitab ?? 'bukhari';
  const name = params.name ?? kitab;
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [nomorInput, setNomorInput] = useState('');
  const [nomor, setNomor] = useState<number | null>(null);

  const booksQuery = useQuery({ queryKey: ['hadith-books'], queryFn: getHadithBooks });
  const knownAvailable = booksQuery.data?.find((book) => book.id === kitab)?.available ?? 0;

  const start = page * PAGE_SIZE + 1;
  const rawEnd = (page + 1) * PAGE_SIZE;
  const end = knownAvailable > 0 ? Math.min(rawEnd, knownAvailable) : rawEnd;
  const range = `${start}-${end}`;

  const rangeQuery = useQuery({
    queryKey: ['hadith-range', kitab, range],
    queryFn: () => getHadithByRange(kitab, range),
  });

  const singleQuery = useQuery({
    queryKey: ['hadith-single', kitab, nomor],
    queryFn: () => getHadithByNumber(kitab, nomor ?? 0),
    enabled: nomor !== null,
  });

  const available = knownAvailable || rangeQuery.data?.available || 0;
  const hasNext = available === 0 || rawEnd < available;
  const singleHadith = singleQuery.data?.contents;

  const handleSearch = () => {
    const parsed = Number.parseInt(nomorInput, 10);
    if (!Number.isFinite(parsed) || parsed < 1) return;
    Keyboard.dismiss();
    const target = available > 0 ? Math.min(parsed, available) : parsed;
    setNomor(target);
    setExpanded(target);
  };

  const clearSearch = () => {
    setNomor(null);
    setNomorInput('');
    setExpanded(null);
  };

  const subtitle = available > 0 ? `${available.toLocaleString('id-ID')} hadits tersedia` : 'Memuat data kitab...';

  return (
    <Screen scroll>
      <PageHeader title={name} subtitle={subtitle} />

      <Animated.View entering={FadeInDown.duration(400).delay(60)} style={styles.searchRow}>
        <Ionicons name="search" size={17} color={colors.textFaint} />
        <TextInput
          style={styles.input}
          value={nomorInput}
          onChangeText={(text) => setNomorInput(text.replace(/[^0-9]/g, ''))}
          placeholder={available > 0 ? `Cari nomor 1-${available.toLocaleString('id-ID')}` : 'Cari nomor hadits'}
          placeholderTextColor={colors.textFaint}
          keyboardType="number-pad"
          returnKeyType="search"
          maxLength={7}
          onSubmitEditing={handleSearch}
        />
        <PressableScale onPress={handleSearch} style={styles.searchBtn} disabled={nomorInput.length === 0}>
          <Text style={styles.searchBtnText}>Cari</Text>
        </PressableScale>
      </Animated.View>

      {nomor !== null ? (
        <View style={styles.section}>
          <PressableScale onPress={clearSearch} style={styles.backToList}>
            <Ionicons name="arrow-back" size={15} color={colors.primary} />
            <Text style={styles.backToListText}>Kembali ke daftar hadits</Text>
          </PressableScale>
          {singleQuery.isPending ? (
            <SkeletonList count={1} height={280} />
          ) : singleQuery.isError ? (
            <ErrorState message={singleQuery.error?.message} onRetry={() => singleQuery.refetch()} />
          ) : singleHadith ? (
            <HadithCard
              hadith={singleHadith}
              expanded={expanded === singleHadith.number}
              onToggle={() => setExpanded(expanded === singleHadith.number ? null : singleHadith.number)}
              sourceLabel={singleQuery.data?.name ?? name}
            />
          ) : null}
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.pager}>
            <PressableScale
              onPress={() => setPage((current) => Math.max(0, current - 1))}
              disabled={page === 0}
              style={[styles.pagerBtn, page === 0 && styles.pagerBtnDisabled]}
            >
              <Ionicons name="chevron-back" size={16} color={page === 0 ? colors.textFaint : colors.text} />
              <Text style={[styles.pagerBtnText, page === 0 && styles.pagerBtnTextDisabled]}>Sebelumnya</Text>
            </PressableScale>
            <Text style={styles.pagerLabel} numberOfLines={1}>
              {start}-{end}
            </Text>
            <PressableScale
              onPress={() => setPage((current) => current + 1)}
              disabled={!hasNext}
              style={[styles.pagerBtn, !hasNext && styles.pagerBtnDisabled]}
            >
              <Text style={[styles.pagerBtnText, !hasNext && styles.pagerBtnTextDisabled]}>Berikutnya</Text>
              <Ionicons name="chevron-forward" size={16} color={!hasNext ? colors.textFaint : colors.text} />
            </PressableScale>
          </View>

          {rangeQuery.isPending ? (
            <SkeletonList count={4} height={92} />
          ) : rangeQuery.isError ? (
            <ErrorState message={rangeQuery.error?.message} onRetry={() => rangeQuery.refetch()} />
          ) : rangeQuery.data && rangeQuery.data.hadiths.length > 0 ? (
            <View style={styles.list}>
              {rangeQuery.data.hadiths.map((hadith, index) => (
                <HadithCard
                  key={`${kitab}-${hadith.number}`}
                  hadith={hadith}
                  expanded={expanded === hadith.number}
                  onToggle={() => setExpanded(expanded === hadith.number ? null : hadith.number)}
                  sourceLabel={rangeQuery.data?.name ?? name}
                  delay={Math.min(index, 8) * 50}
                />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Tidak ada hadits pada rentang ini.</Text>
          )}

          {rangeQuery.data ? (
            hasNext ? (
              <PressableScale onPress={() => setPage((current) => current + 1)} style={styles.loadMore}>
                <Ionicons name="arrow-down" size={16} color={colors.primary} />
                <Text style={styles.loadMoreText}>Muat 50 berikutnya</Text>
              </PressableScale>
            ) : (
              <Text style={styles.endText}>Semua hadits telah dimuat</Text>
            )
          ) : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.base,
    height: 48,
    marginBottom: spacing.lg,
  },
  input: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  searchBtn: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  searchBtnText: {
    fontFamily: font.bold,
    fontSize: 13,
    color: colors.primary,
  },
  section: {
    gap: spacing.md,
  },
  backToList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: radius.full,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  backToListText: {
    fontFamily: font.semibold,
    fontSize: 12,
    color: colors.primary,
  },
  pager: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  pagerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
  },
  pagerBtnDisabled: {
    opacity: 0.45,
  },
  pagerBtnText: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.text,
  },
  pagerBtnTextDisabled: {
    color: colors.textFaint,
  },
  pagerLabel: {
    fontFamily: font.bold,
    fontSize: 13,
    color: colors.gold,
  },
  list: {
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.base,
  },
  badge: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
  },
  badgeText: {
    fontFamily: font.bold,
    fontSize: 12,
    color: colors.primary,
  },
  preview: {
    flex: 1,
    fontFamily: font.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  cardBody: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.base,
    gap: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  translation: {
    fontFamily: font.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
  },
  actionText: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.textMuted,
  },
  actionTextActive: {
    color: colors.primary,
  },
  loadMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.35)',
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    marginTop: spacing.xs,
  },
  loadMoreText: {
    fontFamily: font.bold,
    fontSize: 14,
    color: colors.primary,
  },
  endText: {
    fontFamily: font.regular,
    fontSize: 12,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptyText: {
    fontFamily: font.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});

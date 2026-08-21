import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { PressableScale } from './pressable-scale';
import { colors, radius, spacing, typography } from '@/theme';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Animated.View entering={FadeIn.duration(350)} style={styles.container}>
      <Animated.View entering={ZoomIn.springify().delay(80)}>
        <Ionicons name="cloud-offline-outline" size={56} color={colors.textMuted} />
      </Animated.View>
      <Text style={styles.title}>Waduh, gagal memuat</Text>
      <Text style={styles.message}>{message ?? 'Periksa koneksi internet Anda lalu coba lagi.'}</Text>
      {onRetry ? (
        <PressableScale onPress={onRetry} style={styles.retryBtn}>
          <Ionicons name="refresh" size={18} color={colors.bg} />
          <Text style={styles.retryText}>Coba Lagi</Text>
        </PressableScale>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.sm,
  },
  title: {
    ...typography.h2,
    marginTop: spacing.md,
  },
  message: {
    ...typography.caption,
    textAlign: 'center',
    maxWidth: 260,
  },
  retryBtn: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
  },
  retryText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: colors.bg,
  },
});

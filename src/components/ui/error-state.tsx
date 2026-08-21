import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { PressableScale } from './pressable-scale';
import { ThemeColors, radius, spacing, useTheme } from '@/theme';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxxl,
      gap: spacing.sm,
    },
    title: {
      fontFamily: 'Inter_700Bold',
      fontSize: 18,
      lineHeight: 24,
      color: c.text,
      marginTop: spacing.md,
    },
    message: {
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
      lineHeight: 17,
      color: c.textMuted,
      textAlign: 'center',
      maxWidth: 260,
    },
    retryBtn: {
      marginTop: spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: c.primary,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: radius.full,
    },
    retryText: {
      fontFamily: 'Inter_700Bold',
      fontSize: 14,
    },
  });

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { colors, scheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const retryTextColor = scheme === 'dark' ? '#061009' : '#FFFFFF';

  return (
    <Animated.View entering={FadeIn.duration(350)} style={styles.container}>
      <Animated.View entering={ZoomIn.springify().delay(80)}>
        <Ionicons name="cloud-offline-outline" size={56} color={colors.textMuted} />
      </Animated.View>
      <Text style={styles.title}>Waduh, gagal memuat</Text>
      <Text style={styles.message}>{message ?? 'Periksa koneksi internet Anda lalu coba lagi.'}</Text>
      {onRetry ? (
        <PressableScale onPress={onRetry} style={styles.retryBtn}>
          <Ionicons name="refresh" size={18} color={retryTextColor} />
          <Text style={[styles.retryText, { color: retryTextColor }]}>Coba Lagi</Text>
        </PressableScale>
      ) : null}
    </Animated.View>
  );
}

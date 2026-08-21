import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { ThemeColors, spacing, useTheme } from '@/theme';

const DOT_SIZE = 10;

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxxl,
      gap: spacing.md,
    },
    dotsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    label: {
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
      lineHeight: 17,
      color: c.textMuted,
    },
  });

const dotShape = StyleSheet.create({
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});

function Dot({ delay, color }: { delay: number; color: string }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(-8, { duration: 320 }), withTiming(0, { duration: 320 })), -1),
    );
  }, [delay, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[dotShape.dot, { backgroundColor: color }, animatedStyle]} />;
}

export function LoadingView({ label = 'Memuat...' }: { label?: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.dotsRow}>
        <Dot delay={0} color={colors.primary} />
        <Dot delay={140} color={colors.primary} />
        <Dot delay={280} color={colors.primary} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

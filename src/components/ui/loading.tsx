import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { colors, spacing, typography } from '@/theme';

const DOT_SIZE = 10;

function Dot({ delay }: { delay: number }) {
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

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

export function LoadingView({ label = 'Memuat...' }: { label?: string }) {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.dotsRow}>
        <Dot delay={0} />
        <Dot delay={140} />
        <Dot delay={280} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.caption,
  },
});

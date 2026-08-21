import { useEffect } from 'react';
import { DimensionValue, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/theme';

function SkeletonBlock({ width, height, radius = 14, delay = 0 }: { width: DimensionValue; height: number; radius?: number; delay?: number }) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withDelay(delay, withRepeat(withTiming(1, { duration: 750 }), -1, true));
  }, [delay, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[styles.block, { width, height, borderRadius: radius, backgroundColor: colors.surfaceAlt }, animatedStyle]}
    />
  );
}

export function SkeletonList({ count = 5, height = 88 }: { count?: number; height?: number }) {
  return (
    <View style={styles.list} pointerEvents="none">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonBlock key={index} width="100%" height={height} delay={index * 90} />
      ))}
    </View>
  );
}

export { SkeletonBlock };

const styles = StyleSheet.create({
  block: {},
  list: {
    gap: 12,
  },
});

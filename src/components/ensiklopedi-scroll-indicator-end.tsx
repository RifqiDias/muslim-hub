import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, radius, shadow, spacing } from '@/theme';

interface ScrollIndicatorEndProps {
  visible: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export function ScrollIndicatorEnd({ visible, onPress, style }: ScrollIndicatorEndProps) {
  if (!visible) return null;
  return (
    <Animated.View
      entering={FadeIn.duration(250)}
      exiting={FadeOut.duration(250)}
      pointerEvents="box-none"
      style={[styles.layer, style]}
      collapsable={false}
    >
      <PressableScale onPress={onPress} style={styles.button} hitSlop={8}>
        <Ionicons name="arrow-down" size={22} color={colors.bg} />
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
    paddingRight: spacing.xs,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
});

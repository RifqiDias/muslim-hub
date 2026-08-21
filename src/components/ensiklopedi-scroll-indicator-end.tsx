import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ThemeColors, radius, shadow, spacing, useTheme } from '@/theme';

interface ScrollIndicatorEndProps {
  visible: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
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
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow.card,
    },
  });

export function ScrollIndicatorEnd({ visible, onPress, style }: ScrollIndicatorEndProps) {
  const { colors, scheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
        <Ionicons name="arrow-down" size={22} color={scheme === 'dark' ? '#061009' : '#FFFFFF'} />
      </PressableScale>
    </Animated.View>
  );
}

import * as Haptics from 'expo-haptics';
import { PropsWithChildren } from 'react';
import { GestureResponderEvent, Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface PressableScaleProps {
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
  disabled?: boolean;
  hitSlop?: number | { top: number; bottom: number; left: number; right: number };
}

export function PressableScale({
  children,
  onPress,
  style,
  scaleTo = 0.965,
  haptic = true,
  disabled = false,
  hitSlop,
}: PropsWithChildren<PressableScaleProps>) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = (event: GestureResponderEvent) => {
    if (haptic && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
    onPress?.(event);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={() => {
          scale.value = withTiming(scaleTo, { duration: 110 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 160 });
        }}
        onPress={handlePress}
        disabled={disabled}
        style={style}
        hitSlop={hitSlop}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

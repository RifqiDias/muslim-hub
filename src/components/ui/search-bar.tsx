import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PressableScale } from './pressable-scale';
import { ThemeColors, font, radius, spacing, useTheme } from '@/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  delay?: number;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: radius.full,
      paddingHorizontal: spacing.lg,
      height: 48,
    },
    focused: {
      borderColor: c.primary,
    },
    input: {
      flex: 1,
      fontFamily: font.regular,
      fontSize: 14,
      color: c.text,
      paddingVertical: 0,
    },
  });

export function SearchBar({ value, onChangeText, placeholder = 'Cari...', delay = 0 }: SearchBarProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const styles = makeStyles(colors);

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(delay)}>
      <View style={[styles.container, focused && styles.focused]}>
        <Ionicons name="search" size={18} color={focused ? colors.primary : colors.textMuted} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textFaint}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          returnKeyType="search"
        />
        {value.length > 0 ? (
          <PressableScale onPress={() => onChangeText('')} haptic={false} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </PressableScale>
        ) : null}
      </View>
    </Animated.View>
  );
}

import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PressableScale } from './pressable-scale';
import { ThemeColors, font, radius, spacing, useTheme } from '@/theme';

export interface ChipOption<K extends string> {
  key: K;
  label: string;
}

interface ChipRowProps<K extends string> {
  options: ChipOption<K>[];
  value: K;
  onChange: (key: K) => void;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    pressArea: {
      borderRadius: radius.full,
    },
    chip: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm + 2,
      borderRadius: radius.full,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    chipActive: {
      backgroundColor: c.primarySoft,
      borderColor: c.primary,
    },
    chipText: {
      fontFamily: font.semibold,
      fontSize: 13,
      color: c.textMuted,
    },
    chipTextActive: {
      color: c.primary,
    },
  });

export function ChipRow<K extends string>({ options, value, onChange }: ChipRowProps<K>) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.row}>
      {options.map((option, index) => {
        const active = option.key === value;
        return (
          <Animated.View key={option.key} entering={FadeInDown.springify().delay(index * 60)}>
            <PressableScale onPress={() => onChange(option.key)} style={styles.pressArea}>
              <View style={[styles.chip, active && styles.chipActive]}>
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
              </View>
            </PressableScale>
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}

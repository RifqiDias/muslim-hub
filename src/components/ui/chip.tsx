import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PressableScale } from './pressable-scale';
import { colors, font, radius, spacing } from '@/theme';

export interface ChipOption<K extends string> {
  key: K;
  label: string;
}

interface ChipRowProps<K extends string> {
  options: ChipOption<K>[];
  value: K;
  onChange: (key: K) => void;
}

export function ChipRow<K extends string>({ options, value, onChange }: ChipRowProps<K>) {
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

const styles = StyleSheet.create({
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: font.semibold,
    fontSize: 13,
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.primary,
  },
});

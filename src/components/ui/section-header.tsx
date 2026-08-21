import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PressableScale } from './pressable-scale';
import { ThemeColors, spacing, useTheme } from '@/theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xl,
      marginBottom: spacing.md,
    },
    title: {
      fontFamily: 'Inter_700Bold',
      fontSize: 17,
      color: c.text,
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    actionText: {
      fontFamily: 'Inter_600SemiBold',
      fontSize: 13,
      color: c.primary,
    },
  });

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {actionLabel && onAction ? (
        <PressableScale onPress={onAction} haptic={false}>
          <View style={styles.action}>
            <Text style={styles.actionText}>{actionLabel}</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        </PressableScale>
      ) : null}
    </Animated.View>
  );
}

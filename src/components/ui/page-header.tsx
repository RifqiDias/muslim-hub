import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PressableScale } from './pressable-scale';
import { ThemeColors, spacing, useTheme } from '@/theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.base,
    },
    backBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    titles: {
      flex: 1,
    },
    title: {
      fontFamily: 'Inter_700Bold',
      fontSize: 22,
      lineHeight: 28,
      color: c.text,
    },
    subtitle: {
      fontFamily: 'Inter_400Regular',
      fontSize: 12,
      lineHeight: 17,
      color: c.textMuted,
      marginTop: 2,
    },
  });

export function PageHeader({ title, subtitle, back = true, right }: PageHeaderProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Animated.View entering={FadeInDown.duration(450)} style={styles.row}>
      {back ? (
        <PressableScale onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </PressableScale>
      ) : null}
      <View style={styles.titles}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </Animated.View>
  );
}

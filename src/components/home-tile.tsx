import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PressableScale } from '@/components/ui/pressable-scale';
import { ThemeColors, ThemeGradients, font, radius, spacing, useTheme } from '@/theme';

interface HomeTileProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient?: keyof ThemeGradients;
  onPress: () => void;
  delay?: number;
}

const makeStyles = (c: ThemeColors, scheme: 'light' | 'dark') =>
  StyleSheet.create({
    pressArea: {
      borderRadius: radius.lg,
    },
    tile: {
      alignItems: 'flex-start',
      padding: spacing.base,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: scheme === 'dark' ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.65)',
    },
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.72)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: font.semibold,
      fontSize: 14,
      color: c.text,
      marginTop: spacing.md,
    },
    subtitle: {
      fontFamily: font.regular,
      fontSize: 11.5,
      lineHeight: 16,
      color: c.textMuted,
      marginTop: 3,
    },
  });

export function HomeTile({ title, subtitle, icon, gradient = 'emerald', onPress, delay = 0 }: HomeTileProps) {
  const { colors, gradients, scheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors, scheme), [colors, scheme]);

  return (
    <Animated.View entering={FadeInDown.springify().delay(delay)}>
      <PressableScale onPress={onPress} style={styles.pressArea}>
        <LinearGradient
          colors={[...gradients[gradient]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tile}
        >
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={20} color={colors.gold} />
          </View>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          ) : null}
        </LinearGradient>
      </PressableScale>
    </Animated.View>
  );
}

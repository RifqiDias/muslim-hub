import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PressableScale } from './pressable-scale';
import { ThemeColors, font, radius, spacing, useTheme } from '@/theme';

export type FeatureGradient = 'emerald' | 'teal' | 'gold' | 'night' | 'plum';

interface FeatureCardProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient?: FeatureGradient;
  onPress: () => void;
  delay?: number;
}

const makeStyles = (c: ThemeColors) =>
  StyleSheet.create({
    pressArea: {
      borderRadius: radius.lg,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      padding: spacing.base,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
    },
    iconWrap: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: c.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrap: {
      flex: 1,
    },
    title: {
      fontFamily: font.semibold,
      fontSize: 15,
      color: c.text,
    },
    subtitle: {
      fontFamily: font.regular,
      fontSize: 12,
      color: c.textMuted,
      marginTop: 2,
    },
  });

export function FeatureCard({ title, subtitle, icon, gradient = 'emerald', onPress, delay = 0 }: FeatureCardProps) {
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const grad = gradients[gradient];

  return (
    <Animated.View entering={FadeInDown.springify().delay(delay)}>
      <PressableScale onPress={onPress} style={styles.pressArea}>
        <LinearGradient colors={[...grad]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name={icon} size={22} color={colors.gold} />
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={2}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </LinearGradient>
      </PressableScale>
    </Animated.View>
  );
}

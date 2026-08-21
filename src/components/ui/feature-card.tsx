import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PressableScale } from './pressable-scale';
import { colors, font, radius, spacing } from '@/theme';

export type FeatureGradient = 'emerald' | 'teal' | 'gold' | 'night' | 'plum';

interface FeatureCardProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient?: readonly [string, string] | FeatureGradient;
  onPress: () => void;
  delay?: number;
}

const GRADIENT_MAP: Record<FeatureGradient, readonly [string, string]> = {
  emerald: ['#0B3B2A', '#0F5A3C'],
  teal: ['#0E3A3A', '#116B5E'],
  gold: ['#3E2E14', '#8A6A2F'],
  night: ['#171E3B', '#2B3566'],
  plum: ['#331A33', '#5A2A55'],
};

export function FeatureCard({ title, subtitle, icon, gradient = 'emerald', onPress, delay = 0 }: FeatureCardProps) {
  const grad = typeof gradient === 'string' ? GRADIENT_MAP[gradient] : gradient;

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
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
        </LinearGradient>
      </PressableScale>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
    borderColor: 'rgba(255,255,255,0.09)',
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontFamily: font.semibold,
    fontSize: 15,
    color: colors.text,
  },
  subtitle: {
    fontFamily: font.regular,
    fontSize: 12,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 2,
  },
});

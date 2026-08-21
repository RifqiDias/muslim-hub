import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PressableScale } from '@/components/ui/pressable-scale';
import { colors, font, gradients, radius, spacing } from '@/theme';

interface HomeTileProps {
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradient?: keyof typeof gradients;
  onPress: () => void;
  delay?: number;
}

export function HomeTile({ title, subtitle, icon, gradient = 'emerald', onPress, delay = 0 }: HomeTileProps) {
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

const styles = StyleSheet.create({
  pressArea: {
    borderRadius: radius.lg,
  },
  tile: {
    alignItems: 'flex-start',
    padding: spacing.base,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: font.semibold,
    fontSize: 14,
    color: colors.text,
    marginTop: spacing.md,
  },
  subtitle: {
    fontFamily: font.regular,
    fontSize: 11.5,
    lineHeight: 16,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 3,
  },
});

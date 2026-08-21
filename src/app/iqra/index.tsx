import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { PageHeader } from '@/components/ui/page-header';
import { PressableScale } from '@/components/ui/pressable-scale';
import { Screen } from '@/components/ui/screen';
import {
  font,
  radius,
  shadow,
  spacing,
  useTheme,
  type ThemeColors,
  type ThemeGradients,
  type ThemeScheme,
} from '@/theme';

const VOLUMES: { vol: number; gradient: keyof ThemeGradients }[] = [
  { vol: 1, gradient: 'emerald' },
  { vol: 2, gradient: 'teal' },
  { vol: 3, gradient: 'gold' },
  { vol: 4, gradient: 'night' },
  { vol: 5, gradient: 'plum' },
  { vol: 6, gradient: 'primary' },
];

export default function IqraScreen() {
  const { colors, gradients, scheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors, scheme), [colors, scheme]);

  return (
    <Screen scroll>
      <PageHeader title="Iqra" subtitle="Pilih jilid untuk mulai belajar" />
      <View style={styles.grid}>
        {VOLUMES.map((item) => (
          <Animated.View
            key={item.vol}
            entering={FadeInDown.duration(500).delay(80 * item.vol)}
            style={[styles.cardWrap, shadow.card]}
          >
            <PressableScale
              onPress={() => router.push({ pathname: '/iqra/[vol]', params: { vol: String(item.vol) } })}
              style={styles.card}
            >
              <LinearGradient
                colors={[...gradients[item.gradient]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGrad}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="book" size={24} color={scheme === 'dark' ? colors.white : colors.text} />
                </View>
                <Text style={styles.cardTitle}>Jilid {item.vol}</Text>
                <Text style={styles.cardSub}>Belajar membaca Al Qur&apos;an</Text>
              </LinearGradient>
            </PressableScale>
          </Animated.View>
        ))}
      </View>
    </Screen>
  );
}

const makeStyles = (c: ThemeColors, scheme: ThemeScheme) =>
  StyleSheet.create({
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: '3%',
      rowGap: spacing.base,
      paddingBottom: spacing.xl,
    },
    cardWrap: {
      width: '48.5%',
      borderRadius: radius.xl,
    },
    card: {
      borderRadius: radius.xl,
      overflow: 'hidden',
    },
    cardGrad: {
      minHeight: 176,
      padding: spacing.lg,
      justifyContent: 'space-between',
    },
    iconCircle: {
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: scheme === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(23,39,32,0.08)',
      borderWidth: 1,
      borderColor: scheme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(23,39,32,0.14)',
    },
    cardTitle: {
      fontFamily: font.extrabold,
      fontSize: 24,
      lineHeight: 30,
      color: scheme === 'dark' ? c.white : c.text,
      marginTop: spacing.base,
    },
    cardSub: {
      fontFamily: font.regular,
      fontSize: 12,
      lineHeight: 17,
      color: scheme === 'dark' ? 'rgba(255,255,255,0.75)' : c.textMuted,
      marginTop: 2,
    },
  });

import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren, useMemo } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeColors, ThemeGradients, useTheme } from '@/theme';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  contentStyle?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

const makeStyles = (c: ThemeColors, g: ThemeGradients) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: c.bg,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 40,
    },
    plainContent: {
      paddingHorizontal: 20,
      paddingTop: 8,
    },
  });

export function Screen({ children, scroll = false, contentStyle, refreshing = false, onRefresh, edges }: ScreenProps) {
  const { colors, gradients } = useTheme();
  const styles = useMemo(() => makeStyles(colors, gradients), [colors, gradients]);

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.plainContent, contentStyle]}>{children}</View>
  );

  return (
    <View style={styles.flex}>
      <LinearGradient colors={[...gradients.bg]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex} edges={edges ?? ['top', 'bottom']}>
        {body}
      </SafeAreaView>
    </View>
  );
}

import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, gradients } from '@/theme';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  contentStyle?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function Screen({ children, scroll = false, contentStyle, refreshing = false, onRefresh, edges }: ScreenProps) {
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

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.bg,
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

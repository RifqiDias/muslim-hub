import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren, ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, gradients } from '@/theme';

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  contentStyle?: ViewStyle;
  refreshControl?: ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

export function Screen({ children, scroll = false, contentStyle, refreshControl, edges }: ScreenProps) {
  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        refreshControl ? (
          <RefreshControl
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressBackgroundColor={colors.surface}
            refreshing={false}
            {...(refreshControl as object)}
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

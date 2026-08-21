import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

export default function TabsLayout() {
  const { colors } = useTheme();
  const styles = useMemo(() => StyleSheet.create(stylesFactory(colors)), [colors]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 10.5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: "Qur'an",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'book' : 'book-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="jadwal"
        options={{
          title: 'Shalat',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'time' : 'time-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dzikir"
        options={{
          title: 'Dzikir',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'moon' : 'moon-outline'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Lainnya',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const stylesFactory = (c: { bg: string; surface: string; border: string }) => ({
  bar: {
    backgroundColor: c.surface,
    borderTopColor: c.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: 64,
    paddingTop: 6,
    paddingBottom: 10,
    elevation: 0,
    shadowOpacity: 0,
  },
});

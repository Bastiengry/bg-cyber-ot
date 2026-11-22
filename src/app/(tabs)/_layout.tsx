import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';

const ICONS: Record<string, string> = {
  index: '⌂',
  cours: '📚',
  ateliers: '🧪',
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>
      {ICONS[name] ?? '•'}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '800' },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          height: 62,
          paddingBottom: Spacing.sm,
          paddingTop: Spacing.sm,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'BG Cyber OT', tabBarLabel: 'Accueil', tabBarIcon: () => <TabIcon name="index" focused={false} /> }}
      />
      <Tabs.Screen
        name="cours"
        options={{ title: 'Cours', tabBarLabel: 'Cours', tabBarIcon: ({ focused }) => <TabIcon name="cours" focused={focused} /> }}
      />
      <Tabs.Screen
        name="ateliers"
        options={{ title: 'Ateliers pratiques', tabBarLabel: 'Ateliers', tabBarIcon: ({ focused }) => <TabIcon name="ateliers" focused={focused} /> }}
      />
    </Tabs>
  );
}

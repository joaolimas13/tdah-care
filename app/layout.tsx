import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { AppProvider } from '../context/AppContext';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      <Text style={{ fontSize: 10, color: focused ? '#1565C0' : '#546E7A', fontWeight: focused ? '700' : '400' }}>
        {label}
      </Text>
    </View>
  );
}

export default function Layout() {
  return (
    <AppProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            height: 70,
            paddingBottom: 8,
            paddingTop: 6,
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0,
            shadowColor: '#1565C0',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 8,
          },
          tabBarShowLabel: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Início" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="sono"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="😴" label="Sono" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="metas"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="🎯" label="Metas" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="calendario"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="🗓️" label="Histórico" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="caverna"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={{ alignItems: 'center', gap: 2, backgroundColor: '#1A1A2E', borderRadius: 12, padding: 6, paddingHorizontal: 10 }}>
                <Text style={{ fontSize: 20 }}>🏔️</Text>
                <Text style={{ fontSize: 10, color: focused ? '#A78BFA' : '#9CA3AF', fontWeight: focused ? '700' : '400' }}>Caverna</Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="info"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon emoji="📚" label="Info" focused={focused} />,
          }}
        />
      </Tabs>
    </AppProvider>
  );
}
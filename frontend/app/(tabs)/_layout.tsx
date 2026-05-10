import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../config/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; label: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'today', label: 'Today',  icon: 'home-outline',       iconActive: 'home'        },
  { name: 'learn', label: 'Learn',  icon: 'book-outline',       iconActive: 'book'        },
  { name: 'dsa',   label: 'DSA',    icon: 'code-slash-outline',  iconActive: 'code-slash'  },
  { name: 'jobs',  label: 'Jobs',   icon: 'briefcase-outline',  iconActive: 'briefcase'   },
  { name: 'more',  label: 'More',   icon: 'grid-outline',       iconActive: 'grid'        },
];

function TabIcon({ name, label, focused }: { name: IconName; label: string; focused: boolean }) {
  return (
    <View style={s.item}>
      <View style={[s.pill, focused && s.pillActive]}>
        <Ionicons name={name} size={22} color={focused ? C.primary : C.muted} />
      </View>
      <Text style={[s.label, focused && s.labelActive]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarStyle: s.bar, tabBarShowLabel: false }}>
      {TABS.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon name={focused ? tab.iconActive : tab.icon} label={tab.label} focused={focused} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const s = StyleSheet.create({
  bar:        { backgroundColor: C.surface, borderTopColor: C.border, borderTopWidth: 1, height: 72 },
  item:       { alignItems: 'center', gap: 2, width: 62 },
  pill:       { width: 46, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: C.primary + '22' },
  label:      { color: C.muted, fontSize: 11, fontWeight: '500', textAlign: 'center' },
  labelActive:{ color: C.primary, fontWeight: '700' },
});

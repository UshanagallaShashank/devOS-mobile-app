import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../config/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; label: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'today', label: 'Today',  icon: 'home-outline',      iconActive: 'home' },
  { name: 'learn', label: 'Learn',  icon: 'book-outline',      iconActive: 'book' },
  { name: 'dsa',   label: 'DSA',    icon: 'code-slash-outline', iconActive: 'code-slash' },
  { name: 'jobs',  label: 'Jobs',   icon: 'briefcase-outline', iconActive: 'briefcase' },
  { name: 'more',  label: 'More',   icon: 'grid-outline',      iconActive: 'grid' },
];

function TabIcon({ name, label, focused }: { name: IconName; label: string; focused: boolean }) {
  return (
    <View style={s.iconWrap}>
      <View style={[s.iconBox, focused && s.iconBoxActive]}>
        <Ionicons name={name} size={20} color={focused ? C.primary : C.muted} />
      </View>
      <Text style={[s.label, focused && s.labelActive]}>{label}</Text>
      {focused && <View style={s.dot} />}
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
  bar:          { backgroundColor: C.surface, borderTopColor: C.border, borderTopWidth: 1, height: 80, paddingBottom: 8, paddingTop: 8 },
  iconWrap:     { alignItems: 'center', gap: 3, paddingTop: 2 },
  iconBox:      { width: 40, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconBoxActive:{ backgroundColor: C.primary + '20' },
  label:        { color: C.muted, fontSize: 10, fontWeight: '500' },
  labelActive:  { color: C.primary, fontWeight: '700' },
  dot:          { width: 4, height: 4, borderRadius: 2, backgroundColor: C.primary, marginTop: 1 },
});

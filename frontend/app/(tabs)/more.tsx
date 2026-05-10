import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signOut } from '../../services/auth';
import { supabase } from '../../services/supabase';
import { C, glow } from '../../config/theme';

const ITEMS = [
  { label: 'Resume',        desc: 'AI review · upload your PDF',          icon: 'document-text', color: C.primary, route: '/resume' as const },
  { label: 'AI Chat',       desc: 'Ask anything · coding, career, life',  icon: 'chatbubbles',   color: C.purple,  route: '/chat'   as const },
  { label: 'Project Ideas', desc: '5 new ideas generated for you',         icon: 'bulb',          color: C.warn,    route: '/ideas'  as const },
  { label: 'AI News',       desc: "Latest HN & Dev.to · 4 min read",      icon: 'newspaper',     color: C.accent,  route: '/news'   as const },
];

async function handleSignOut() {
  Alert.alert('Sign out?', 'You will be redirected to the login screen.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign Out', style: 'destructive', onPress: async () => { await signOut(); } },
  ]);
}

export default function MoreScreen() {
  const [notifyEnabled, setNotifyEnabled] = useState(false);
  const [savingNotify, setSavingNotify]   = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.notify) setNotifyEnabled(true);
    });
  }, []);

  async function toggleNotify(val: boolean) {
    setSavingNotify(true);
    setNotifyEnabled(val);
    await supabase.auth.updateUser({ data: { notify: val } });
    setSavingNotify(false);
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <Text style={s.title}>More</Text>
          <Text style={s.sub}>Resume · Ideas · News · Settings</Text>
        </View>

        {/* Feature cards */}
        <View style={{ gap: 12, marginBottom: 32 }}>
          {ITEMS.map(item => (
            <TouchableOpacity
              key={item.label}
              style={[s.card, glow(item.color, 0.08)]}
              activeOpacity={0.8}
              onPress={() => router.push(item.route)}
            >
              <View style={[s.iconBox, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>{item.label}</Text>
                <Text style={s.cardDesc}>{item.desc}</Text>
              </View>
              <View style={[s.arrowBox, { backgroundColor: item.color + '15', borderColor: item.color + '30' }]}>
                <Ionicons name="arrow-forward" size={15} color={item.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Settings */}
        <Text style={s.sectionLabel}>Settings</Text>
        <View style={s.settingsBox}>

          <TouchableOpacity style={[s.settingsRow, s.settingsBorder]} activeOpacity={0.7} onPress={() => router.push('/profile')}>
            <View style={[s.settingsIcon, { backgroundColor: C.primary + '20' }]}>
              <Ionicons name="person" size={16} color={C.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.settingsLabel}>Profile</Text>
              <Text style={s.settingsHint}>Name, stack, experience, links</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>

          <View style={[s.settingsRow, s.settingsBorder]}>
            <View style={[s.settingsIcon, { backgroundColor: C.purple + '20' }]}>
              <Ionicons name="notifications" size={16} color={C.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.settingsLabel}>Daily Reminders</Text>
              <Text style={s.settingsHint}>{notifyEnabled ? 'Enabled' : 'Off'}{savingNotify ? ' · saving…' : ''}</Text>
            </View>
            <Switch
              value={notifyEnabled}
              onValueChange={toggleNotify}
              trackColor={{ false: C.border, true: C.purple + '80' }}
              thumbColor={notifyEnabled ? C.purple : C.muted}
              disabled={savingNotify}
            />
          </View>

          <TouchableOpacity style={s.settingsRow} activeOpacity={0.7} onPress={handleSignOut}>
            <View style={[s.settingsIcon, { backgroundColor: C.danger + '20' }]}>
              <Ionicons name="log-out" size={16} color={C.danger} />
            </View>
            <Text style={[s.settingsLabel, { color: C.danger }]}>Sign Out</Text>
          </TouchableOpacity>

        </View>

        <Text style={s.version}>DevOS v1.0 · Built with ❤️ and AI</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: C.bg },
  scroll:        { flex: 1, paddingHorizontal: 16 },
  header:        { marginTop: 16, marginBottom: 28 },
  title:         { color: C.text, fontSize: 24, fontWeight: '700' },
  sub:           { color: C.sub, fontSize: 13, marginTop: 4 },
  card:          { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 20, padding: 18, gap: 16 },
  iconBox:       { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  cardTitle:     { color: C.text, fontWeight: '700', fontSize: 15 },
  cardDesc:      { color: C.muted, fontSize: 12, marginTop: 2 },
  arrowBox:      { width: 32, height: 32, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  sectionLabel:  { color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 },
  settingsBox:   { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 20, overflow: 'hidden', marginBottom: 32 },
  settingsRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  settingsBorder:{ borderBottomWidth: 1, borderBottomColor: C.border },
  settingsIcon:  { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingsLabel: { color: C.text, fontSize: 14, fontWeight: '600' },
  settingsHint:  { color: C.muted, fontSize: 12, marginTop: 1 },
  version:       { color: C.muted, fontSize: 12, textAlign: 'center', marginBottom: 32 },
});

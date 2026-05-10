const _err = console.error.bind(console);
console.error = (...a: unknown[]) => { if (typeof a[0] === 'string' && a[0].includes('expo-notifications')) return; _err(...a); };

import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../services/supabase';
import type { Session } from '@supabase/supabase-js';
import { C } from '../config/theme';

function useAuthGuard(session: Session | null, ready: boolean) {
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    if (!ready) return;
    const inAuth       = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    if (!session && !inAuth) router.replace('/(auth)/login');
    if (session && inAuth && !inOnboarding) router.replace('/(tabs)/today');
  }, [session, ready, segments]);
}

function SplashScreen() {
  return (
    <View style={sp.wrap}>
      <Text style={sp.logo}>DevOS</Text>
      <Text style={sp.sub}>Loading…</Text>
    </View>
  );
}

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady]     = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useAuthGuard(session, ready);

  if (!ready) return <SplashScreen />;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="resume"   options={{ presentation: 'modal' }} />
        <Stack.Screen name="ideas"    options={{ presentation: 'modal' }} />
        <Stack.Screen name="news"     options={{ presentation: 'modal' }} />
        <Stack.Screen name="track"    options={{ presentation: 'modal' }} />
        <Stack.Screen name="lesson"   options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-task" options={{ presentation: 'modal' }} />
        <Stack.Screen name="profile"  options={{ presentation: 'modal' }} />
        <Stack.Screen name="chat"     options={{ presentation: 'modal' }} />
      </Stack>
    </View>
  );
}

const sp = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  logo: { color: C.primary, fontSize: 42, fontWeight: '700' },
  sub:  { color: C.muted, fontSize: 14, marginTop: 8 },
});

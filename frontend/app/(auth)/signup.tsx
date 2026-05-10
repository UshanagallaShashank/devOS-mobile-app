import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { signUp } from '../../services/auth';
import { upsertProfile } from '../../services/db';
import { C, glow } from '../../config/theme';

export default function SignupScreen() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  async function handleSignup() {
    if (!email || !password) return Alert.alert('Fill in all fields');
    if (password.length < 6) return Alert.alert('Password too short', 'Minimum 6 characters.');
    setLoading(true);
    const { data, error } = await signUp(email.trim(), password);
    if (error) {
      Alert.alert('Sign up failed', error.message);
      setLoading(false);
      return;
    }
    if (data.user) {
      await upsertProfile(data.user.id, { experience_years: 0, primary_stack: [], onboarded: false });
    }
    setLoading(false);
    router.replace('/onboarding');
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.kav}>

        {/* Logo */}
        <View style={s.logoWrap}>
          <View style={[s.logoIcon, glow(C.accent, 0.35)]}>
            <Ionicons name="rocket" size={30} color={C.accent} />
          </View>
          <Text style={s.title}>DevOS</Text>
          <View style={s.pill}>
            <Text style={s.pillText}>Start your journey</Text>
          </View>
          <Text style={s.tagline}>Your AI-powered career co-pilot</Text>
        </View>

        {/* Form card */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Create your account</Text>

          <View style={s.inputWrap}>
            <Ionicons name="mail-outline" size={17} color={C.muted} />
            <TextInput
              style={s.input}
              placeholder="Email address"
              placeholderTextColor={C.muted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={s.inputWrap}>
            <Ionicons name="lock-closed-outline" size={17} color={C.muted} />
            <TextInput
              style={s.input}
              placeholder="Password (min 6 chars)"
              placeholderTextColor={C.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
            />
            <TouchableOpacity onPress={() => setShowPw(p => !p)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={17} color={C.muted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[s.btn, loading && s.btnDisabled, glow(C.accent, 0.3)]} onPress={handleSignup} disabled={loading} activeOpacity={0.85}>
            {loading
              ? <Text style={s.btnText}>Creating account…</Text>
              : <View style={s.btnInner}><Text style={s.btnText}>Create Account</Text><Ionicons name="arrow-forward" size={16} color="#fff" /></View>
            }
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()} style={s.footer} activeOpacity={0.7}>
          <Text style={s.footerText}>Already have an account? <Text style={s.link}>Sign in →</Text></Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.bg },
  kav:        { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoWrap:   { alignItems: 'center', marginBottom: 36 },
  logoIcon:   { width: 68, height: 68, borderRadius: 22, backgroundColor: C.accent + '18', borderWidth: 1, borderColor: C.accent + '40', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title:      { fontSize: 48, fontWeight: '800', color: C.text, letterSpacing: -1.5 },
  pill:       { backgroundColor: C.accent + '20', borderWidth: 1, borderColor: C.accent + '40', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 5, marginTop: 10 },
  pillText:   { color: C.accent, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  tagline:    { color: C.muted, fontSize: 13, marginTop: 10 },
  card:       { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 24, padding: 20, gap: 12 },
  cardLabel:  { color: C.sub, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingHorizontal: 14 },
  input:      { flex: 1, color: C.text, fontSize: 15, paddingVertical: 14 },
  btn:        { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  btnDisabled:{ opacity: 0.6 },
  btnInner:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText:    { color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 0.3 },
  footer:     { marginTop: 28, alignItems: 'center' },
  footerText: { color: C.sub, fontSize: 14 },
  link:       { color: C.primary, fontWeight: '600' },
});

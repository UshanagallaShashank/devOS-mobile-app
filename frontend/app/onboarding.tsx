import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../services/supabase';
import { upsertProfile } from '../services/db';
import { C } from '../config/theme';

const STEP_COUNT = 4;

const EXP_OPTIONS = ['Student / 0 yrs', '1–2 years', '3–5 years', '6+ years'];
const GOAL_OPTIONS = ['Get first dev job', 'Switch to AI/ML', 'Level up to senior', 'Start a startup', 'Land FAANG'];
const STACK_OPTIONS = ['Python', 'JavaScript', 'TypeScript', 'React', 'React Native', 'Next.js', 'Node.js', 'Go', 'Java', 'C++', 'FastAPI', 'PostgreSQL', 'LLMs / AI'];

function Step({ n, label }: { n: number; label: string }) {
  return (
    <View style={s.stepRow}>
      {Array.from({ length: STEP_COUNT }).map((_, i) => (
        <View key={i} style={[s.stepDot, i < n && s.stepDotActive]} />
      ))}
      <Text style={s.stepLabel}>{label}</Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const [step, setStep]         = useState(1);
  const [name, setName]         = useState('');
  const [exp, setExp]           = useState('');
  const [stack, setStack]       = useState<string[]>([]);
  const [goal, setGoal]         = useState('');
  const [loading, setLoading]   = useState(false);

  function toggleStack(item: string) {
    setStack(prev => prev.includes(item) ? prev.filter(s => s !== item) : [...prev, item]);
  }

  async function finish() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const expYears = exp.startsWith('6') ? 6 : exp.startsWith('3') ? 4 : exp.startsWith('1') ? 1 : 0;
    await upsertProfile(user.id, {
      full_name: name.trim(),
      experience_years: expYears,
      primary_stack: stack,
      career_goal: goal,
      onboarded: true,
    });
    setLoading(false);
    router.replace('/(tabs)/today');
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        {step === 1 && (
          <View style={s.page}>
            <Step n={1} label="Step 1 of 4 — Your Name" />
            <Text style={s.title}>What should we call you?</Text>
            <Text style={s.sub}>This personalises your daily brief and AI responses.</Text>
            <TextInput
              style={s.input}
              placeholder="Full name"
              placeholderTextColor={C.muted}
              value={name}
              onChangeText={setName}
              autoFocus
            />
            <TouchableOpacity style={[s.btn, !name.trim() && s.btnOff]} disabled={!name.trim()} onPress={() => setStep(2)}>
              <Text style={s.btnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View style={s.page}>
            <Step n={2} label="Step 2 of 4 — Experience" />
            <Text style={s.title}>How long have you been coding?</Text>
            <View style={s.optionList}>
              {EXP_OPTIONS.map(o => (
                <TouchableOpacity key={o} style={[s.option, exp === o && s.optionActive]} onPress={() => setExp(o)}>
                  <Text style={[s.optionText, exp === o && s.optionTextActive]}>{o}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[s.btn, !exp && s.btnOff]} disabled={!exp} onPress={() => setStep(3)}>
              <Text style={s.btnText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 3 && (
          <View style={s.page}>
            <Step n={3} label="Step 3 of 4 — Tech Stack" />
            <Text style={s.title}>What's your stack?</Text>
            <Text style={s.sub}>Select all that apply — used to personalise job matches and ideas.</Text>
            <View style={s.chipGrid}>
              {STACK_OPTIONS.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[s.chip, stack.includes(item) && s.chipActive]}
                  onPress={() => toggleStack(item)}
                >
                  <Text style={[s.chipText, stack.includes(item) && s.chipTextActive]}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[s.btn, stack.length === 0 && s.btnOff]} disabled={stack.length === 0} onPress={() => setStep(4)}>
              <Text style={s.btnText}>Continue ({stack.length} selected)</Text>
            </TouchableOpacity>
          </View>
        )}

        {step === 4 && (
          <View style={s.page}>
            <Step n={4} label="Step 4 of 4 — Your Goal" />
            <Text style={s.title}>What's your career goal?</Text>
            <View style={s.optionList}>
              {GOAL_OPTIONS.map(o => (
                <TouchableOpacity key={o} style={[s.option, goal === o && s.optionActive]} onPress={() => setGoal(o)}>
                  <Text style={[s.optionText, goal === o && s.optionTextActive]}>{o}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[s.btn, (!goal || loading) && s.btnOff]} disabled={!goal || loading} onPress={finish}>
              <Text style={s.btnText}>{loading ? 'Setting up your DevOS…' : 'Launch DevOS 🚀'}</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: C.bg },
  scroll:          { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  page:            { flex: 1 },
  stepRow:         { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 32 },
  stepDot:         { width: 28, height: 4, borderRadius: 2, backgroundColor: C.border },
  stepDotActive:   { backgroundColor: C.primary },
  stepLabel:       { color: C.muted, fontSize: 12, marginLeft: 6 },
  title:           { color: C.text, fontSize: 26, fontWeight: '700', marginBottom: 10 },
  sub:             { color: C.sub, fontSize: 14, lineHeight: 20, marginBottom: 28 },
  input:           { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, color: C.text, fontSize: 18, marginBottom: 24 },
  optionList:      { gap: 10, marginBottom: 32 },
  option:          { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 14, padding: 16 },
  optionActive:    { borderColor: C.primary, backgroundColor: C.primary + '18' },
  optionText:      { color: C.sub, fontSize: 15, fontWeight: '500' },
  optionTextActive:{ color: C.primary },
  chipGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 32 },
  chip:            { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 99, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  chipActive:      { borderColor: C.primary, backgroundColor: C.primary + '22' },
  chipText:        { color: C.muted, fontSize: 13, fontWeight: '500' },
  chipTextActive:  { color: C.primary },
  btn:             { backgroundColor: C.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnOff:          { opacity: 0.35 },
  btnText:         { color: '#fff', fontWeight: '700', fontSize: 16 },
});

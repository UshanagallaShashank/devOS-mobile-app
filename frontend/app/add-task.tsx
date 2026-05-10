import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { addTask } from '../services/db';
import { C } from '../config/theme';

const TAGS = ['DSA', 'Learn', 'Jobs', 'Resume', 'Other'];

export default function AddTaskScreen() {
  const [label, setLabel]       = useState('');
  const [tag, setTag]           = useState('DSA');
  const [startTime, setStart]   = useState('');
  const [endTime, setEnd]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSave() {
    if (!label.trim()) return Alert.alert('Enter a task description');
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not signed in');
      await addTask(user.id, label.trim(), tag, startTime.trim() || undefined, endTime.trim() || undefined);
      router.back();
    } catch (error) {
      Alert.alert('Save failed', 'Unable to save this task. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.kav}>
        <View style={s.header}>
          <Text style={s.title}>Add Task</Text>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={24} color={C.muted} />
          </TouchableOpacity>
        </View>

        <Text style={s.label}>What do you want to do today?</Text>
        <TextInput
          style={s.input}
          placeholder="e.g. Solve Two Sum on LeetCode"
          placeholderTextColor={C.muted}
          value={label}
          onChangeText={setLabel}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={handleSave}
          multiline
        />

        <Text style={s.label}>Time slot (optional)</Text>
        <View style={s.timeRow}>
          <TextInput
            style={[s.input, s.timeInput]}
            placeholder="Start  e.g. 6:00 PM"
            placeholderTextColor={C.muted}
            value={startTime}
            onChangeText={setStart}
            returnKeyType="next"
          />
          <TextInput
            style={[s.input, s.timeInput]}
            placeholder="End  e.g. 6:30 PM"
            placeholderTextColor={C.muted}
            value={endTime}
            onChangeText={setEnd}
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        </View>

        <Text style={s.label}>Category</Text>
        <View style={s.tagRow}>
          {TAGS.map(t => (
            <TouchableOpacity
              key={t}
              style={[s.tagChip, t === tag && s.tagChipActive]}
              activeOpacity={0.75}
              onPress={() => setTag(t)}
            >
              <Text style={[s.tagText, t === tag && s.tagTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[s.btn, (!label.trim() || loading) && s.btnDisabled]} activeOpacity={0.8} onPress={handleSave} disabled={!label.trim() || loading}>
          <Text style={s.btnText}>{loading ? 'Saving…' : 'Add to Today'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bg },
  kav:          { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  title:        { color: C.text, fontSize: 22, fontWeight: '700' },
  label:        { color: C.sub, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 10 },
  input:        { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, color: C.text, fontSize: 16, lineHeight: 24, marginBottom: 28, minHeight: 80 },
  timeRow:      { flexDirection: 'row', gap: 10, marginBottom: 28 },
  timeInput:    { flex: 1, minHeight: 0, fontSize: 14, lineHeight: 20 },
  tagRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 36 },
  tagChip:      { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 99, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface },
  tagChipActive:{ backgroundColor: C.primary, borderColor: C.primary },
  tagText:      { color: C.muted, fontSize: 14, fontWeight: '500' },
  tagTextActive:{ color: '#fff' },
  btn:          { backgroundColor: C.primary, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  btnDisabled:  { opacity: 0.4 },
  btnText:      { color: '#fff', fontWeight: '700', fontSize: 16 },
});

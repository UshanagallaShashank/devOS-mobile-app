import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { updateTask, deleteTask } from '../services/db';
import { C } from '../config/theme';

const TAGS = ['DSA', 'Learn', 'Jobs', 'Resume', 'Other'];

export default function EditTaskScreen() {
  const params = useLocalSearchParams<{ id: string; label: string; tag: string; start_time: string; end_time: string }>();
  const [label, setLabel]     = useState(params.label ?? '');
  const [tag, setTag]         = useState(params.tag ?? 'DSA');
  const [startTime, setStart] = useState(params.start_time ?? '');
  const [endTime, setEnd]     = useState(params.end_time ?? '');
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!label.trim()) return Alert.alert('Enter a task description');
    setLoading(true);
    try {
      await updateTask(params.id, label.trim(), tag, startTime.trim() || undefined, endTime.trim() || undefined);
      router.back();
    } catch {
      Alert.alert('Save failed', 'Unable to update this task.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    Alert.alert('Delete task', 'Remove this task?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try { await deleteTask(params.id); router.back(); }
        catch { Alert.alert('Delete failed'); }
      }},
    ]);
  }

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={s.kav}>
        <View style={s.header}>
          <Text style={s.title}>Edit Task</Text>
          <View style={s.headerRight}>
            <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="trash-outline" size={22} color={C.danger} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Ionicons name="close" size={24} color={C.muted} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={s.label}>Task</Text>
        <TextInput
          style={s.input}
          placeholder="What do you want to do?"
          placeholderTextColor={C.muted}
          value={label}
          onChangeText={setLabel}
          autoFocus
          multiline
          returnKeyType="done"
        />

        <Text style={s.label}>Time slot (optional)</Text>
        <View style={s.timeRow}>
          <TextInput style={[s.input, s.timeInput]} placeholder="Start  e.g. 6:00 PM" placeholderTextColor={C.muted} value={startTime} onChangeText={setStart} returnKeyType="next" />
          <TextInput style={[s.input, s.timeInput]} placeholder="End  e.g. 6:30 PM" placeholderTextColor={C.muted} value={endTime} onChangeText={setEnd} returnKeyType="done" onSubmitEditing={handleSave} />
        </View>

        <Text style={s.label}>Category</Text>
        <View style={s.tagRow}>
          {TAGS.map(t => (
            <TouchableOpacity key={t} style={[s.tagChip, t === tag && s.tagChipActive]} activeOpacity={0.75} onPress={() => setTag(t)}>
              <Text style={[s.tagText, t === tag && s.tagTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[s.btn, (!label.trim() || loading) && s.btnDisabled]} activeOpacity={0.8} onPress={handleSave} disabled={!label.trim() || loading}>
          <Text style={s.btnText}>{loading ? 'Saving…' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bg },
  kav:          { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  headerRight:  { flexDirection: 'row', alignItems: 'center', gap: 18 },
  title:        { color: C.text, fontSize: 22, fontWeight: '700' },
  label:        { color: C.sub, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.4, marginBottom: 10 },
  input:        { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, color: C.text, fontSize: 16, lineHeight: 24, marginBottom: 24, minHeight: 80 },
  timeRow:      { flexDirection: 'row', gap: 10, marginBottom: 24 },
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

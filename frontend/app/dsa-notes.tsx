import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ENV } from '../config/env';
import { C, glow } from '../config/theme';

type Notes = {
  analogy:     string;
  description: string;
  intuition:   string;
  approach:    string;
  complexity:  string;
  patterns:    string[];
  gotchas:     string[];
};

const DIFF_COLOR: Record<string, string> = { E: C.accent, M: C.warn, H: C.danger };

export default function DSANotesScreen() {
  const { problem, category } = useLocalSearchParams<{ problem: string; category: string }>();
  const [notes, setNotes]     = useState<Notes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function fetchNotes() {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${ENV.API_URL}/api/v1/dsa/notes`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ problem, category }),
      });
      if (!res.ok) throw new Error('Failed to load notes');
      const data = await res.json();
      setNotes(data);
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons name="arrow-back" size={22} color={C.muted} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={s.probTitle} numberOfLines={1}>{problem}</Text>
          <Text style={s.catLabel}>{category}</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {!notes && !loading && (
          <View style={s.emptyState}>
            <View style={[s.iconWrap, glow(C.primary, 0.2)]}>
              <Ionicons name="bulb-outline" size={36} color={C.primary} />
            </View>
            <Text style={s.emptyTitle}>Get AI Notes</Text>
            <Text style={s.emptySub}>
              Your personal senior engineer mentor will explain this problem — analogy first, then intuition, then approach.
            </Text>
            {error ? <Text style={s.errorText}>{error}</Text> : null}
            <TouchableOpacity style={[s.generateBtn, glow(C.primary, 0.15)]} onPress={fetchNotes} activeOpacity={0.85}>
              <Ionicons name="sparkles-outline" size={16} color="#fff" />
              <Text style={s.generateBtnText}>Generate Notes</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && (
          <View style={s.loadingState}>
            <ActivityIndicator color={C.primary} size="large" />
            <Text style={s.loadingText}>Your mentor is explaining this…</Text>
          </View>
        )}

        {notes && !loading && (
          <View style={{ paddingBottom: 40 }}>
            {/* Analogy */}
            <View style={[s.analogyCard, glow(C.primary, 0.1)]}>
              <View style={s.sectionHeader}>
                <Ionicons name="sunny-outline" size={16} color={C.primary} />
                <Text style={s.sectionTitle}>Real-World Analogy</Text>
              </View>
              <Text style={s.analogyText}>{notes.analogy}</Text>
            </View>

            {/* Description */}
            <View style={s.noteCard}>
              <View style={s.sectionHeader}>
                <Ionicons name="document-text-outline" size={16} color={C.sub} />
                <Text style={s.sectionTitle}>What It's Asking</Text>
              </View>
              <Text style={s.noteBody}>{notes.description}</Text>
            </View>

            {/* Intuition */}
            <View style={[s.noteCard, { borderColor: C.warn + '50' }]}>
              <View style={s.sectionHeader}>
                <Ionicons name="flash-outline" size={16} color={C.warn} />
                <Text style={[s.sectionTitle, { color: C.warn }]}>Key Intuition</Text>
              </View>
              <Text style={s.noteBody}>{notes.intuition}</Text>
            </View>

            {/* Approach */}
            <View style={s.noteCard}>
              <View style={s.sectionHeader}>
                <Ionicons name="list-outline" size={16} color={C.sub} />
                <Text style={s.sectionTitle}>Approach</Text>
              </View>
              <Text style={s.noteBody}>{notes.approach}</Text>
            </View>

            {/* Complexity */}
            <View style={s.inlineRow}>
              <View style={[s.complexCard, { flex: 1 }]}>
                <Ionicons name="speedometer-outline" size={15} color={C.primary} />
                <Text style={s.complexText}>{notes.complexity}</Text>
              </View>
            </View>

            {/* Patterns */}
            {notes.patterns?.length > 0 && (
              <View style={s.noteCard}>
                <View style={s.sectionHeader}>
                  <Ionicons name="git-branch-outline" size={16} color={C.accent} />
                  <Text style={[s.sectionTitle, { color: C.accent }]}>Patterns Used</Text>
                </View>
                <View style={s.tagRow}>
                  {notes.patterns.map((p, i) => (
                    <View key={i} style={s.patternTag}>
                      <Text style={s.patternTagText}>{p}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Gotchas */}
            {notes.gotchas?.length > 0 && (
              <View style={[s.noteCard, { borderColor: C.danger + '50' }]}>
                <View style={s.sectionHeader}>
                  <Ionicons name="warning-outline" size={16} color={C.danger} />
                  <Text style={[s.sectionTitle, { color: C.danger }]}>Watch Out For</Text>
                </View>
                {notes.gotchas.map((g, i) => (
                  <View key={i} style={s.gotchaRow}>
                    <View style={s.gotchaDot} />
                    <Text style={s.noteBody}>{g}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Regenerate */}
            <TouchableOpacity style={s.regenBtn} onPress={fetchNotes} activeOpacity={0.8}>
              <Ionicons name="refresh-outline" size={14} color={C.muted} />
              <Text style={s.regenText}>Regenerate</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: C.bg },
  topBar:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border },
  probTitle:       { color: C.text, fontWeight: '700', fontSize: 16 },
  catLabel:        { color: C.muted, fontSize: 12, marginTop: 2 },
  scroll:          { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  emptyState:      { alignItems: 'center', paddingTop: 60, gap: 14, paddingHorizontal: 24 },
  iconWrap:        { width: 72, height: 72, borderRadius: 22, backgroundColor: C.surface, borderWidth: 1, borderColor: C.primary + '40', alignItems: 'center', justifyContent: 'center' },
  emptyTitle:      { color: C.text, fontWeight: '700', fontSize: 20 },
  emptySub:        { color: C.muted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  errorText:       { color: C.danger, fontSize: 13, textAlign: 'center' },
  generateBtn:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: C.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 28, marginTop: 8 },
  generateBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  loadingState:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 120, gap: 16 },
  loadingText:     { color: C.muted, fontSize: 14 },
  analogyCard:     { backgroundColor: C.primary + '10', borderWidth: 1, borderColor: C.primary + '40', borderRadius: 18, padding: 16, marginBottom: 12 },
  analogyText:     { color: C.text, fontSize: 15, lineHeight: 24, fontStyle: 'italic', fontWeight: '500' },
  noteCard:        { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 16, marginBottom: 12 },
  sectionHeader:   { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  sectionTitle:    { color: C.sub, fontWeight: '700', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.8 },
  noteBody:        { color: C.text, fontSize: 14, lineHeight: 22, flex: 1 },
  inlineRow:       { flexDirection: 'row', gap: 10, marginBottom: 12 },
  complexCard:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: C.surface, borderWidth: 1, borderColor: C.primary + '40', borderRadius: 14, padding: 14 },
  complexText:     { color: C.text, fontSize: 13, lineHeight: 20, flex: 1 },
  tagRow:          { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  patternTag:      { backgroundColor: C.accent + '18', borderWidth: 1, borderColor: C.accent + '40', borderRadius: 8, paddingHorizontal: 11, paddingVertical: 5 },
  patternTagText:  { color: C.accent, fontSize: 12, fontWeight: '600' },
  gotchaRow:       { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  gotchaDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: C.danger, marginTop: 8 },
  regenBtn:        { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: C.border, marginTop: 4 },
  regenText:       { color: C.muted, fontSize: 13, fontWeight: '500' },
});

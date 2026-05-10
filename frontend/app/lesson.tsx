import { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ENV } from '../config/env';
import { C, glow } from '../config/theme';

type LessonContent = {
  intro: string;
  key_points: string[];
  example: string;
  example_is_code: boolean;
  summary: string;
};

export default function LessonScreen() {
  const { title = '', track = 'Software Engineering' } = useLocalSearchParams<{ title: string; track: string }>();
  const [content, setContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    fetch(`${ENV.API_URL}/api/v1/learn/lesson`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ title, track }),
    })
      .then(async r => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.detail || 'Could not generate lesson');
        return data;
      })
      .then(data => { setContent(data); setLoading(false); })
      .catch(() => { setError('Could not load lesson. Is the backend running?'); setLoading(false); });
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={C.muted} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.trackLabel}>{track}</Text>
          <Text style={s.title} numberOfLines={2}>{title}</Text>
        </View>
      </View>

      {loading && (
        <View style={s.center}>
          <ActivityIndicator color={C.primary} size="large" />
          <Text style={s.loadingText}>Generating lesson with AI…</Text>
        </View>
      )}

      {error !== '' && !loading && (
        <View style={s.center}>
          <Ionicons name="cloud-offline-outline" size={40} color={C.muted} />
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity style={s.retryBtn} onPress={() => { setError(''); setLoading(true); }}>
            <Text style={s.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {content && !loading && (
        <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Intro */}
          <View style={[s.introCard, glow(C.primary, 0.12)]}>
            <View style={s.introIcon}>
              <Ionicons name="book" size={20} color={C.primary} />
            </View>
            <Text style={s.introText}>{content.intro}</Text>
          </View>

          {/* Key Points */}
          <Text style={s.sectionLabel}>Key Concepts</Text>
          <View style={s.pointsCard}>
            {content.key_points.map((pt, i) => (
              <View key={i} style={[s.point, i < content.key_points.length - 1 && s.pointBorder]}>
                <View style={s.pointNum}>
                  <Text style={s.pointNumText}>{i + 1}</Text>
                </View>
                <Text style={s.pointText}>{pt}</Text>
              </View>
            ))}
          </View>

          {/* Example */}
          <Text style={s.sectionLabel}>{content.example_is_code ? 'Code Example' : 'Real-World Example'}</Text>
          <View style={content.example_is_code ? s.codeBlock : s.exampleCard}>
            {content.example_is_code && (
              <View style={s.codeHeader}>
                <Ionicons name="code-slash" size={14} color={C.muted} />
                <Text style={s.codeLabel}>Example</Text>
              </View>
            )}
            <Text style={content.example_is_code ? s.codeText : s.exampleText}>{content.example}</Text>
          </View>

          {/* Summary */}
          <View style={[s.summaryCard, glow(C.accent, 0.1)]}>
            <Ionicons name="bulb" size={18} color={C.accent} />
            <Text style={s.summaryText}>{content.summary}</Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: C.bg },
  header:       { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  back:         { marginTop: 4, padding: 4 },
  trackLabel:   { color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.2 },
  title:        { color: C.text, fontSize: 20, fontWeight: '700', marginTop: 4 },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  loadingText:  { color: C.sub, fontSize: 14, marginTop: 8 },
  errorText:    { color: C.muted, fontSize: 14, textAlign: 'center' },
  retryBtn:     { backgroundColor: C.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8 },
  retryText:    { color: '#fff', fontWeight: '700' },
  scroll:       { flex: 1, padding: 16 },
  introCard:    { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.primary + '40', borderRadius: 18, padding: 16, marginBottom: 24 },
  introIcon:    { width: 36, height: 36, borderRadius: 11, backgroundColor: C.primary + '20', alignItems: 'center', justifyContent: 'center' },
  introText:    { flex: 1, color: C.text, fontSize: 15, lineHeight: 23 },
  sectionLabel: { color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.3, marginBottom: 10 },
  pointsCard:   { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 18, overflow: 'hidden', marginBottom: 24 },
  point:        { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  pointBorder:  { borderBottomWidth: 1, borderBottomColor: C.border },
  pointNum:     { width: 24, height: 24, borderRadius: 8, backgroundColor: C.primary + '20', alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  pointNumText: { color: C.primary, fontSize: 12, fontWeight: '700' },
  pointText:    { flex: 1, color: C.text, fontSize: 14, lineHeight: 21 },
  codeBlock:    { backgroundColor: '#0D1117', borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, marginBottom: 24 },
  codeHeader:   { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  codeLabel:    { color: C.muted, fontSize: 11 },
  codeText:     { color: '#E6EDF3', fontSize: 13, fontFamily: 'monospace', lineHeight: 22 },
  exampleCard:  { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, padding: 16, marginBottom: 24 },
  exampleText:  { color: C.text, fontSize: 14, lineHeight: 22 },
  summaryCard:  { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: C.accent + '10', borderWidth: 1, borderColor: C.accent + '40', borderRadius: 16, padding: 16, marginBottom: 24 },
  summaryText:  { flex: 1, color: C.text, fontSize: 14, lineHeight: 21, fontWeight: '500' },
});
